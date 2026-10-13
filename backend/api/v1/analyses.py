"""
DIME Backend — Analyses API Endpoints.

Handles creating and retrieving analyses.
"""

from __future__ import annotations

import asyncio
import json
from collections.abc import AsyncGenerator
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import StreamingResponse

from backend.core.database import AsyncSession, get_db
from backend.core.cache import get_redis_client
from backend.models.analysis import Analysis, AnalysisStatus
from backend.worker.tasks import run_analysis_pipeline
from backend.models.scoring import AnalysisScore
from backend.models.evidence import Evidence, Finding
from backend.models.analysis import AgentActivity, SourceIngestion
from sqlalchemy import select

# This will be replaced with real NextAuth validation later.
# For now, we mock auth to allow frontend integration.

router = APIRouter()


@router.post("")
async def create_analysis(
    payload: dict[str, Any],
    db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """
    Create a new analysis.
    
    In Phase 1, this just returns a mock response so the frontend
    can be wired up to the FastAPI backend.
    """
    # Extract fields (matching existing Next.js logic)
    title = payload.get("title", "").strip()
    description = payload.get("description", "").strip()
    target_audience = payload.get("targetAudience", "").strip().lower()
    
    industry = payload.get("industry")
    if not industry:
        industry = payload.get("domain")
    industry = str(industry).strip() if industry else ""
    
    if not title or not description or not target_audience or not industry:
        raise HTTPException(status_code=400, detail="Missing fields")
        
    if len(title) < 4 or len(description) < 30:
        raise HTTPException(
            status_code=400,
            detail="Title or description is too short for meaningful analysis"
        )
        
    user_id = payload.get("userId") or payload.get("user_id") or "anonymous"
    idea_id = payload.get("ideaId") or payload.get("idea_id") or "dummy-idea-id"

    # Phase 2: Create Analysis in DB and queue Celery task
    analysis = Analysis(
        title=title,
        description=description,
        target_audience=target_audience,
        domain=industry,
        user_id=user_id,
        idea_id=idea_id,
        status=AnalysisStatus.PENDING
    )
    
    db.add(analysis)
    await db.commit()
    await db.refresh(analysis)
    
    # Queue the celery task
    run_analysis_pipeline.delay(analysis.id)
    
    return {
        "id": analysis.id,
        "status": analysis.status,
        "message": "Analysis queued successfully"
    }


async def _resolve_analysis(db: AsyncSession, identifier: str) -> Analysis | None:
    """Resolve analysis by primary key id or by idea_id fallback."""
    analysis = await db.get(Analysis, identifier)
    if not analysis:
        res = await db.execute(
            select(Analysis).where(Analysis.idea_id == identifier).order_by(Analysis.created_at.desc())
        )
        analysis = res.scalars().first()
    return analysis


@router.get("/{analysis_id}")
async def get_analysis(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get status and result of a specific analysis."""
    analysis = await _resolve_analysis(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    return {
        "id": analysis.id,
        "status": analysis.status,
        "title": analysis.title,
        "description": analysis.description,
        "domain": analysis.domain,
        "target_audience": analysis.target_audience,
        "current_stage": analysis.current_stage or "PENDING",
        "progress": analysis.progress or 0,
        "error_message": analysis.error_message,
        "sources_attempted": analysis.sources_attempted,
        "sources_succeeded": analysis.sources_succeeded,
        "started_at": analysis.started_at.isoformat() if analysis.started_at else None,
        "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
    }


@router.get("/{analysis_id}/events")
async def get_analysis_events(
    analysis_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> StreamingResponse:
    """
    Server-Sent Events endpoint for streaming analysis progress.
    """
    # 1. Read the current Analysis state from PostgreSQL
    analysis = await _resolve_analysis(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    resolved_id = analysis.id

    async def event_generator() -> AsyncGenerator[str, None]:
        # 2. Send an initial state/progress event
        initial_payload = {
            "type": "analysis_status",
            "analysis_id": analysis.id,
            "status": analysis.status,
            "stage": analysis.current_stage or "PENDING",
            "progress": analysis.progress,
        }
        if analysis.error_message:
            initial_payload["error"] = analysis.error_message
            
        yield f"data: {json.dumps(initial_payload)}\n\n"
        
        # Terminate immediately if already done
        if analysis.status in (AnalysisStatus.COMPLETED, AnalysisStatus.FAILED):
            return

        # 3. Subscribe to Redis Pub/Sub for new events
        redis = await get_redis_client()
        pubsub = redis.pubsub()
        channel = f"analysis:events:{resolved_id}"
        await pubsub.subscribe(channel)

        try:
            while True:
                if await request.is_disconnected():
                    break
                    
                message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1.0)
                if message and message["type"] == "message":
                    data_str = message["data"] if isinstance(message["data"], str) else message["data"].decode("utf-8")
                    yield f"data: {data_str}\n\n"
                    
                    # 4. Terminate on COMPLETED or FAILED
                    try:
                        data = json.loads(data_str)
                        if data.get("status") in (AnalysisStatus.COMPLETED.value, AnalysisStatus.FAILED.value):
                            break
                    except json.JSONDecodeError:
                        pass
                
                await asyncio.sleep(0.1)
        finally:
            await pubsub.unsubscribe(channel)
            await pubsub.close()

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.get("/{analysis_id}/report")
async def get_analysis_report(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get the structured analysis report including scores."""
    analysis = await _resolve_analysis(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    resolved_id = analysis.id
    result = await db.execute(
        select(AnalysisScore).where(AnalysisScore.analysis_id == resolved_id)
    )
    scores = result.scalars().all()
    
    finding_result = await db.execute(
        select(Finding).where(Finding.analysis_id == resolved_id)
    )
    findings = finding_result.scalars().all()
    
    formatted_scores = {}
    for score in scores:
        formatted_scores[score.metric_name] = {
            "score": score.score,
            "status": score.status,
            "explanation": score.explanation,
            "inputs": json.loads(score.inputs) if score.inputs else None,
            "evidence_references": json.loads(score.evidence_references) if score.evidence_references else None,
        }
        
    formatted_findings = [
        {
            "category": f.category,
            "title": f.title,
            "description": f.description,
            "confidence": f.confidence,
            "evidence_count": f.evidence_count,
            "evidence_ids": json.loads(f.evidence_ids) if f.evidence_ids else list()
        }
        for f in findings
    ]
    
    return {
        "id": analysis.id,
        "status": analysis.status,
        "title": analysis.title,
        "description": analysis.description,
        "domain": analysis.domain,
        "target_audience": analysis.target_audience,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
        "completed_at": analysis.completed_at.isoformat() if analysis.completed_at else None,
        "scores": formatted_scores,
        "findings": formatted_findings,
    }


@router.get("/{analysis_id}/evidence")
async def get_analysis_evidence(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get evidence used in this analysis."""
    analysis = await _resolve_analysis(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    resolved_id = analysis.id
    result = await db.execute(
        select(Evidence).where(Evidence.analysis_id == resolved_id)
    )
    evidence_list = result.scalars().all()
    
    formatted = [
        {
            "id": e.id,
            "evidence_type": e.evidence_type,
            "claim": e.claim,
            "supporting_text": e.supporting_text,
            "source_url": e.source_url,
            "source_title": e.source_title,
            "confidence": e.confidence,
            "relevance_score": e.relevance_score,
            "chunk_id": e.chunk_id,
            "document_id": e.document_id,
        }
        for e in evidence_list
    ]
    
    return {
        "analysis_id": resolved_id,
        "evidence": formatted
    }

@router.get("/{analysis_id}/agents")
async def get_analysis_agents(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get agent activities for this analysis."""
    analysis = await _resolve_analysis(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    resolved_id = analysis.id
    result = await db.execute(
        select(AgentActivity)
        .where(AgentActivity.analysis_id == resolved_id)
        .order_by(AgentActivity.created_at.asc())
    )
    activities = result.scalars().all()
    
    formatted = [
        {
            "id": a.id,
            "agent_name": a.agent_name,
            "action": a.action,
            "details": json.loads(a.details) if a.details else None,
            "status": a.status,
            "timestamp": a.created_at.isoformat()
        }
        for a in activities
    ]
    
    return {
        "analysis_id": resolved_id,
        "agents": formatted
    }


@router.get("/{analysis_id}/sources")
async def get_analysis_sources(
    analysis_id: str,
    db: AsyncSession = Depends(get_db)
) -> dict[str, Any]:
    """Get source ingestions for this analysis."""
    analysis = await _resolve_analysis(db, analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
        
    resolved_id = analysis.id
    result = await db.execute(
        select(SourceIngestion)
        .where(SourceIngestion.analysis_id == resolved_id)
        .order_by(SourceIngestion.created_at.asc())
    )
    sources = result.scalars().all()
    
    formatted = [
        {
            "id": s.id,
            "source_name": s.source_name,
            "status": s.status,
            "records_found": s.records_found,
            "records_indexed": s.records_indexed,
            "error": s.error_message,
            "timestamp": s.created_at.isoformat()
        }
        for s in sources
    ]
    
    return {
        "analysis_id": resolved_id,
        "sources": formatted
    }

