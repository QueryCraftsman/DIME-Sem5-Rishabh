"""
DIME Backend — NextAuth JWT Validation Middleware.

Validates the NextAuth session token issued by the frontend.
"""

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, HTTPException, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from backend.core.config import get_settings

security = HTTPBearer()

async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Security(security)]
) -> dict[str, str]:
    """
    Validate the NextAuth JWT token and return the user payload.
    
    NextAuth uses JWE (encrypted) by default, or JWT. 
    In Phase 1, we assume NextAuth is configured for standard JWT
    or we're accepting a Firebase ID token.
    
    Note: If NextAuth's default JWE is used, we need `hkdf` to derive the 
    encryption key from NEXTAUTH_SECRET. For now, this is a placeholder
    to establish the Dependency injection pattern.
    """
    settings = get_settings()
    token = credentials.credentials
    
    # In development with no strict auth, return a mock user
    if settings.is_development and token == "dev-token":
        return {"sub": "dev-user-id", "email": "dev@example.com"}
        
    try:
        # NOTE: This assumes standard JWT. 
        # For NextAuth V4+, it's often JWE which requires python-jose[cryptography]
        # and key derivation.
        payload = jwt.decode(
            token, 
            settings.backend_secret_key, 
            algorithms=["HS256"]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return {"sub": user_id, "email": payload.get("email", "")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
