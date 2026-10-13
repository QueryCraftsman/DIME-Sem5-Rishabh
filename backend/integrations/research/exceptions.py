"""Research integration exceptions."""
from backend.core.exceptions import ExternalServiceError

class ResearchProviderError(ExternalServiceError):
    """Base exception for research provider errors."""
    pass

class ResearchAuthenticationError(ResearchProviderError):
    """Authentication failed."""
    pass

class ResearchRateLimitError(ResearchProviderError):
    """Rate limit exceeded."""
    pass

class ResearchTimeoutError(ResearchProviderError):
    """Request timed out."""
    pass

class ResearchUnavailableError(ResearchProviderError):
    """Service is unavailable (5xx)."""
    pass

class ResearchMalformedResponseError(ResearchProviderError):
    """Response was malformed or unexpected."""
    pass
