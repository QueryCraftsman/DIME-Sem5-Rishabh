import { NextResponse } from "next/server";
import { auth } from "@/lib/server-auth";
import { prisma } from "@/lib/db";
import { getSimilarity } from "@/lib/analysis/similarity";

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function generatePdfHtml(ideaId: string, userId?: string) {
  // 1. Fetch idea from Prisma
  const idea = await prisma.idea.findFirst({
    where: {
      id: ideaId,
      ...(userId ? { userId } : {}),
    },
  });

  // 2. Fetch rich report from FastAPI if available
  let fastApiReport: any = null;
  try {
    const res = await fetch(`http://localhost:8000/api/v1/analyses/${ideaId}/report`, {
      next: { revalidate: 0 },
    });
    if (res.ok) {
      fastApiReport = await res.json();
    }
  } catch (e) {
    // FastAPI might not be reachable or analysisId is different
  }

  const title = fastApiReport?.title || idea?.title || "DIME Validation Analysis";
  const description = fastApiReport?.description || idea?.description || "";
  const domain = fastApiReport?.domain || idea?.industry || "Technology";
  const targetAudience = fastApiReport?.target_audience || idea?.targetAudience || "General Market";
  const status = fastApiReport?.status || idea?.status || "COMPLETED";

  // Score calculations
  const scores = fastApiReport?.scores || {};
  const noveltyObj = scores["Novelty"];
  const noveltyScore = noveltyObj?.score != null 
    ? (noveltyObj.score > 1 ? noveltyObj.score / 100 : noveltyObj.score) 
    : (idea?.noveltyScore ?? 0.23);

  const marketPainObj = scores["Market Pain"];
  const marketPainScore = marketPainObj?.score != null 
    ? (marketPainObj.score > 1 ? marketPainObj.score / 100 : marketPainObj.score) 
    : (idea?.marketPainScore ?? 0.0);

  const opportunityObj = scores["Opportunity"];
  const opportunityScore = opportunityObj?.score != null 
    ? (opportunityObj.score > 1 ? opportunityObj.score / 100 : opportunityObj.score) 
    : (idea?.opportunityScore ?? 0.0);

  const feasibilityObj = scores["Feasibility"];
  const feasibilityScore = feasibilityObj?.score != null
    ? (feasibilityObj.score > 1 ? feasibilityObj.score : Math.round(feasibilityObj.score * 100))
    : Math.round(idea?.feasibilityScore ?? 50);

  const noveltyLabel = noveltyScore >= 0.7 ? "High" : noveltyScore >= 0.4 ? "Moderate" : "Low";
  const painLabel = marketPainScore >= 0.7 ? "High" : marketPainScore >= 0.4 ? "Moderate" : "Low";
  const opportunityLabel = opportunityScore >= 0.7 ? "High" : opportunityScore >= 0.4 ? "Moderate" : "Low";

  // Similar items
  const similarity = getSimilarity(description);
  const similarProjects = (similarity?.similar_projects ?? []).slice(0, 5);

  const findings: any[] = fastApiReport?.findings || [];

  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)} — DIME Analysis Report</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    background: #fff;
    padding: 48px 52px;
    line-height: 1.6;
  }
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 3px solid #ea580c;
    padding-bottom: 20px;
    margin-bottom: 32px;
  }
  .header h1 { font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px; }
  .header .brand { font-size: 14px; font-weight: 700; color: #ea580c; letter-spacing: 2px; }
  .header .date { font-size: 11px; color: #94a3b8; margin-top: 4px; }
  .section { margin-bottom: 28px; }
  .section-title {
    font-size: 13px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.5px; color: #94a3b8; margin-bottom: 12px;
    padding-bottom: 6px; border-bottom: 1px solid #e2e8f0;
  }
  .idea-title { font-size: 22px; font-weight: 700; color: #0f172a; margin-bottom: 8px; }
  .idea-description { font-size: 14px; color: #475569; line-height: 1.7; }
  .meta-row { display: flex; gap: 32px; margin-top: 12px; }
  .meta-item { font-size: 12px; color: #64748b; }
  .meta-item strong { color: #334155; font-weight: 600; }
  .scores-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
  .score-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; background: #f8fafc; }
  .score-card .label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; margin-bottom: 8px; }
  .score-card .value { font-size: 32px; font-weight: 800; color: #0f172a; }
  .score-card .status-badge { display: inline-block; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 12px; background: #e0f2fe; color: #0369a1; margin-top: 6px; }
  .score-card .status-insufficient { background: #fef3c7; color: #b45309; }
  .score-card .bar { height: 6px; border-radius: 3px; background: #e2e8f0; margin-top: 12px; overflow: hidden; }
  .score-card .bar-fill { height: 100%; border-radius: 3px; background: #ea580c; }
  .score-card .explanation { font-size: 11px; color: #64748b; margin-top: 8px; line-height: 1.4; }
  .findings-table { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-top: 12px; }
  .findings-table th { background: #f1f5f9; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #64748b; padding: 10px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }
  .findings-table td { font-size: 13px; color: #334155; padding: 10px 14px; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
  .findings-table tr:last-child td { border-bottom: none; }
  .badge { display: inline-block; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 12px; padding: 2px 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; color: #475569; }
  .insight-box { border: 2px solid #fed7aa; border-radius: 10px; padding: 20px; background: linear-gradient(135deg, #fff7ed 0%, #fff 100%); }
  .insight-box .insight-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #ea580c; margin-bottom: 8px; }
  .insight-box p { font-size: 14px; color: #334155; line-height: 1.7; font-weight: 500; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; }
  @media print {
    .no-print { display: none !important; }
  }
</style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 24px; text-align: right;">
    <button onclick="window.print()" style="cursor:pointer; background:#ea580c; color:white; border:none; padding:10px 20px; border-radius:8px; font-weight:700; font-size:13px;">
      Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <div class="brand">DIME · AI PRODUCT INTELLIGENCE</div>
      <h1>Idea Analysis &amp; Validation Report</h1>
    </div>
    <div style="text-align: right;">
      <div class="date">Generated: ${generatedAt}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Concept Overview</div>
    <div class="idea-title">${escapeHtml(title)}</div>
    <div class="idea-description">${escapeHtml(description)}</div>
    <div class="meta-row">
      <div class="meta-item"><strong>Domain / Industry:</strong> ${escapeHtml(domain)}</div>
      <div class="meta-item"><strong>Target Audience:</strong> ${escapeHtml(targetAudience)}</div>
      <div class="meta-item"><strong>Validation Status:</strong> ${escapeHtml(status)}</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Deterministic Validation Metrics</div>
    <div class="scores-grid">
      <div class="score-card">
        <div class="label">Novelty Score</div>
        <div class="value">${noveltyObj?.score != null ? noveltyObj.score.toFixed(1) : (noveltyScore * 100).toFixed(0)}</div>
        <span class="status-badge ${noveltyObj?.status === 'INSUFFICIENT_EVIDENCE' ? 'status-insufficient' : ''}">${noveltyObj?.status || 'COMPUTED'}</span>
        <div class="bar"><div class="bar-fill" style="width: ${Math.min(100, Math.round(noveltyScore * 100))}%"></div></div>
        <div class="explanation">${escapeHtml(noveltyObj?.explanation || `${noveltyLabel} Differentiation against retrieved citations.`)}</div>
      </div>
      <div class="score-card">
        <div class="label">Market Saturation</div>
        <div class="value">${scores["Market Saturation"]?.score != null ? scores["Market Saturation"].score.toFixed(1) : "—"}</div>
        <span class="status-badge ${scores["Market Saturation"]?.status === 'INSUFFICIENT_EVIDENCE' ? 'status-insufficient' : ''}">${scores["Market Saturation"]?.status || 'INSUFFICIENT_EVIDENCE'}</span>
        <div class="bar"><div class="bar-fill" style="width: ${scores["Market Saturation"]?.score ? scores["Market Saturation"].score : 0}%"></div></div>
        <div class="explanation">${escapeHtml(scores["Market Saturation"]?.explanation || "Requires additional competitive products in retrieval database.")}</div>
      </div>
      <div class="score-card">
        <div class="label">Market Pain</div>
        <div class="value">${marketPainObj?.score != null ? marketPainObj.score.toFixed(1) : "—"}</div>
        <span class="status-badge ${marketPainObj?.status === 'INSUFFICIENT_EVIDENCE' ? 'status-insufficient' : ''}">${marketPainObj?.status || 'INSUFFICIENT_EVIDENCE'}</span>
        <div class="bar"><div class="bar-fill" style="width: ${marketPainScore * 100}%"></div></div>
        <div class="explanation">${escapeHtml(marketPainObj?.explanation || `${painLabel} Urgency from sentiment signals.`)}</div>
      </div>
      <div class="score-card">
        <div class="label">Feasibility</div>
        <div class="value">${feasibilityObj?.score != null ? feasibilityObj.score.toFixed(1) : "—"}</div>
        <span class="status-badge ${feasibilityObj?.status === 'INSUFFICIENT_EVIDENCE' ? 'status-insufficient' : ''}">${feasibilityObj?.status || 'INSUFFICIENT_EVIDENCE'}</span>
        <div class="bar"><div class="bar-fill" style="width: ${feasibilityScore}%"></div></div>
        <div class="explanation">${escapeHtml(feasibilityObj?.explanation || "Assessed based on domain requirements and tech complexity.")}</div>
      </div>
      <div class="score-card">
        <div class="label">Opportunity Potential</div>
        <div class="value">${opportunityObj?.score != null ? opportunityObj.score.toFixed(1) : "—"}</div>
        <span class="status-badge ${opportunityObj?.status === 'INSUFFICIENT_EVIDENCE' ? 'status-insufficient' : ''}">${opportunityObj?.status || 'INSUFFICIENT_EVIDENCE'}</span>
        <div class="bar"><div class="bar-fill" style="width: ${opportunityScore * 100}%"></div></div>
        <div class="explanation">${escapeHtml(opportunityObj?.explanation || `${opportunityLabel} potential calculated across metrics.`)}</div>
      </div>
      <div class="score-card">
        <div class="label">Risk Profile</div>
        <div class="value">${scores["Risk Indicator"]?.score != null ? scores["Risk Indicator"].score.toFixed(1) : "—"}</div>
        <span class="status-badge ${scores["Risk Indicator"]?.status === 'INSUFFICIENT_EVIDENCE' ? 'status-insufficient' : ''}">${scores["Risk Indicator"]?.status || 'INSUFFICIENT_EVIDENCE'}</span>
        <div class="bar"><div class="bar-fill" style="width: ${scores["Risk Indicator"]?.score ? scores["Risk Indicator"].score : 0}%"></div></div>
        <div class="explanation">${escapeHtml(scores["Risk Indicator"]?.explanation || "Calculated from technical and competitive risks.")}</div>
      </div>
    </div>
  </div>

  ${
    findings.length > 0
      ? `
  <div class="section">
    <div class="section-title">Autonomous Agent Findings (${findings.length})</div>
    <table class="findings-table">
      <thead>
        <tr>
          <th style="width: 15%;">Category</th>
          <th style="width: 35%;">Finding</th>
          <th>Details &amp; Evidence</th>
        </tr>
      </thead>
      <tbody>
        ${findings
          .map(
            (f: any) => `
        <tr>
          <td><span class="badge">${escapeHtml(f.category)}</span></td>
          <td><strong>${escapeHtml(f.title)}</strong></td>
          <td>
            <div style="font-size:12px; margin-bottom:4px;">${escapeHtml(f.description)}</div>
            <div style="font-size:11px; color:#64748b;">Confidence: ${(f.confidence * 100).toFixed(0)}% · Evidences: ${f.evidence_count}</div>
          </td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>`
      : ""
  }

  ${
    similarProjects.length > 0
      ? `
  <div class="section">
    <div class="section-title">Discovered Similar Projects &amp; Repositories (${similarProjects.length})</div>
    <table class="findings-table">
      <thead>
        <tr>
          <th style="width: 20%;">Type</th>
          <th>Description</th>
          <th style="width: 15%;">Similarity</th>
        </tr>
      </thead>
      <tbody>
        ${similarProjects
          .map(
            (p: { description: string; score: number; type: string }) => `
        <tr>
          <td><span class="badge">${p.type === "idea" ? "Similar Idea" : "GitHub Repo"}</span></td>
          <td>${escapeHtml(p.description)}</td>
          <td><strong>${(p.score * 100).toFixed(1)}%</strong></td>
        </tr>`
          )
          .join("")}
      </tbody>
    </table>
  </div>`
      : ""
  }

  <div class="footer">
    DIME — Autonomous Product Intelligence &amp; Multi-Source Validation Platform · Confidential &amp; Proprietary
  </div>
</body>
</html>`;
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const ideaId = searchParams.get("ideaId")?.trim();

    if (!ideaId) {
      return new NextResponse("Missing ideaId parameter", { status: 400 });
    }

    const html = await generatePdfHtml(ideaId, session?.user?.id);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("EXPORT_PDF_HTML_GET_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const body = await req.json();
    const ideaId = typeof body?.ideaId === "string" ? body.ideaId.trim() : "";

    if (!ideaId) {
      return new NextResponse("Missing ideaId", { status: 400 });
    }

    const html = await generatePdfHtml(ideaId, session?.user?.id);

    return new NextResponse(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error: unknown) {
    console.error("EXPORT_PDF_HTML_POST_ERROR", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
