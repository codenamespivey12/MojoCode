from pydantic import SecretStr

from openhands.core.logger import openhands_logger as logger
from openhands.integrations.github.github_service import GitHubService
from openhands.integrations.provider import ProviderType


async def validate_provider_token(
    token: SecretStr, base_domain: str | None = None
) -> ProviderType | None:
    """
    Determine whether a token is for GitHub by attempting to get user info
    from the service.

    Args:
        token: The token to check
        base_domain: Optional base domain for the service

    Returns:
        'github' if it's a GitHub token
        None if the token is invalid for all services
    """
    # Skip validation for empty tokens
    if token is None:
        return None

    # Try GitHub first
    github_error = None
    try:
        github_service = GitHubService(token=token, base_domain=base_domain)
        await github_service.verify_access()
        return ProviderType.GITHUB
    except Exception as e:
        github_error = e

    # No other providers supported

    logger.debug(f'Failed to validate token: {github_error}')

    return None
