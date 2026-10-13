"""
GitHub API specific exceptions.
"""


class GitHubIntegrationError(Exception):
    """Base exception for all GitHub integration errors."""

    pass


class GitHubAuthenticationError(GitHubIntegrationError):
    """Raised when authentication fails (401/403)."""

    pass


class GitHubRateLimitExceeded(GitHubIntegrationError):
    """Raised when the primary rate limit is exhausted."""

    def __init__(self, reset_epoch: int) -> None:
        self.reset_epoch = reset_epoch
        super().__init__(f"GitHub API primary rate limit exceeded. Resets at {reset_epoch}.")


class GitHubSecondaryRateLimitError(GitHubIntegrationError):
    """Raised when secondary rate limits block the request, even after retries."""

    pass


class GitHubResourceNotFoundError(GitHubIntegrationError):
    """Raised when a specific repository or resource is not found (404)."""

    pass


class GitHubTimeoutError(GitHubIntegrationError):
    """Raised when a request to GitHub times out."""

    pass


class GitHubMalformedResponseError(GitHubIntegrationError):
    """Raised when GitHub returns unexpected data formats."""

    pass


class GitHubUnavailableError(GitHubIntegrationError):
    """Raised when GitHub API is down (5xx)."""

    pass
