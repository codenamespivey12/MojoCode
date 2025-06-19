import os
from typing import TYPE_CHECKING, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from openhands.runtime.utils.git_handler import CommandResult, GitHandler
from openhands.integrations.github.github_service import GitHubService, GithubServiceImpl

if TYPE_CHECKING:
    GitHubServiceType = GitHubService
else:
    GitHubServiceType = GitHubService
# Placeholder for User model, replace with actual import if available
class User:
    def __init__(self, id_str: str):
        self.id_str = id_str

# Placeholder for get_current_user dependency, replace with actual implementation
async def get_current_user() -> User:
    # In a real app, this would involve token validation and user lookup
    print("WARNING: Using placeholder get_current_user. Implement proper authentication.")
    return User(id_str="placeholder_user_id")

# Placeholder for get_github_service dependency, replace with actual implementation
async def get_github_service() -> GitHubService:
    # In a real app, this would fetch user-specific token and initialize the service
    print("WARNING: Using placeholder get_github_service. Implement proper GitHub service initialization.")
    # This would typically require credentials, e.g., from the current_user or a config
    # For now, creating a dummy instance. It won't work for actual GitHub operations without a token.
    return GithubServiceImpl(token="dummy_token_for_placeholder")


# Placeholder shell execution function
def placeholder_execute_shell_fn(command: str, cwd: str | None = None) -> CommandResult:
    print(f"Executing command: {command} in {cwd if cwd else 'default CWD'}")
    # Simulate success for most commands, specific commands might need mock failure for testing
    if "clone" in command and "failclone" in command: # a way to simulate clone failure for testing
        return CommandResult(content="simulated clone failure", exit_code=1)
    if "init" in command and "failinit" in command:
        return CommandResult(content="simulated init failure", exit_code=1)
    # Add more failure simulations as needed for robust testing of endpoints
    return CommandResult(content="Simulated success", exit_code=0)

# Pydantic Models
class ImportRepoRequest(BaseModel):
    repo_url: str

class ExportRepoRequest(BaseModel):
    project_path: str # Path relative to user's workspace, e.g., "my_project_dir"
    repo_name: str
    description: str = ""
    private: bool = False

class RepoResponse(BaseModel):
    message: str
    details: Optional[str] = None
    html_url: Optional[str] = None
    clone_url: Optional[str] = None

router = APIRouter()

# Base workspace directory
WORKSPACE_BASE = "/workspace" # Assume this is a valid writable path in the environment

# TODO: Ensure WORKSPACE_BASE is created or configurable


@router.post("/import", response_model=RepoResponse)
async def import_repository(
    request: ImportRepoRequest, current_user: User = Depends(get_current_user)
):
    git_handler = GitHandler(execute_shell_fn=placeholder_execute_shell_fn)

    user_workspace = os.path.join(WORKSPACE_BASE, current_user.id_str)
    os.makedirs(user_workspace, exist_ok=True)

    if not request.repo_url.endswith(".git"):
        raise HTTPException(status_code=400, detail="Invalid repository URL. Must end with .git")

    repo_name_from_url = request.repo_url.split("/")[-1].replace(".git", "")
    if not repo_name_from_url: # Handle empty or bad repo name
        raise HTTPException(status_code=400, detail="Could not determine repository name from URL.")

    local_repo_path = os.path.join(user_workspace, repo_name_from_url)

    if os.path.exists(local_repo_path):
        raise HTTPException(status_code=400, detail=f"Repository '{repo_name_from_url}' already exists locally at {local_repo_path}.")

    try:
        success = git_handler.clone_repo(request.repo_url, local_repo_path)
        if success:
            return RepoResponse(
                message=f"Repository '{request.repo_url}' imported successfully to '{local_repo_path}'.",
                details=f"Local path: {local_repo_path}"
            )
        else:
            # Try to remove partially cloned directory if clone failed
            if os.path.exists(local_repo_path):
                try:
                    import shutil
                    shutil.rmtree(local_repo_path)
                except Exception as e:
                    # Log this error, as it might leave clutter but shouldn't fail the whole request
                    print(f"Error cleaning up partially cloned directory {local_repo_path}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to clone repository '{request.repo_url}'.")
    except Exception as e:
        # Catch any other unexpected errors during the process
        # Also try to clean up
        if os.path.exists(local_repo_path):
            try:
                import shutil
                shutil.rmtree(local_repo_path)
            except Exception as cleanup_e:
                print(f"Error cleaning up directory {local_repo_path} after an exception: {cleanup_e}")
        raise HTTPException(status_code=500, detail=f"An error occurred during repository import: {str(e)}")


@router.post("/export", response_model=RepoResponse)
async def export_repository(
    request: ExportRepoRequest,
    current_user: User = Depends(get_current_user),
    gh_service: GitHubService = Depends(get_github_service),
):
    git_handler = GitHandler(execute_shell_fn=placeholder_execute_shell_fn)
    user_workspace = os.path.join(WORKSPACE_BASE, current_user.id_str)

    # Ensure project_path is relative and within the user's workspace
    # For example, if project_path is "my_project", local_project_path becomes "/workspace/user_id/my_project"
    # User should not provide absolute paths like "/etc/passwd"
    if os.path.isabs(request.project_path) or ".." in request.project_path:
        raise HTTPException(status_code=400, detail="Invalid project path. Must be a relative path within your workspace.")

    local_project_path = os.path.join(user_workspace, request.project_path)
    os.makedirs(user_workspace, exist_ok=True) # Ensure user workspace exists

    if not os.path.isdir(local_project_path):
        raise HTTPException(status_code=404, detail=f"Project path '{local_project_path}' does not exist or is not a directory.")

    try:
        # 1. Initialize local repository
        if not git_handler.init_repo(local_project_path):
            raise HTTPException(status_code=500, detail="Failed to initialize Git repository.")

        # 2. Add all files and commit
        commit_message = "Initial commit by OpenHands"
        if not git_handler.add_all_and_commit(local_project_path, commit_message):
            raise HTTPException(status_code=500, detail="Failed to add and commit files.")

        # 3. Create remote repository on GitHub
        created_repo_info = await gh_service.create_repository(
            repo_name=request.repo_name,
            description=request.description,
            private=request.private,
        )

        if "error" in created_repo_info:
            raise HTTPException(
                status_code=created_repo_info.get("status_code", 500), # Use status_code from error if available
                detail=f"GitHub API error: {created_repo_info.get('details', created_repo_info['error'])}"
            )

        html_url = created_repo_info.get("html_url")
        clone_url = created_repo_info.get("clone_url")

        if not clone_url:
            raise HTTPException(status_code=500, detail="Failed to get clone URL from GitHub response.")

        # 4. Add remote to local repository
        if not git_handler.add_remote(local_project_path, "origin", clone_url):
            # Attempt to clean up by deleting the created GitHub repo if adding remote fails?
            # For now, just report error. A more robust solution might try to roll back.
            raise HTTPException(status_code=500, detail="Failed to add remote 'origin'.")

        # 5. Push to remote
        # TODO: Determine the default branch name. 'main' is common, but could be 'master'.
        # GitHandler could have a method to get default branch or this could be configurable.
        # For now, assuming 'main'.
        if not git_handler.push_to_remote(local_project_path, "origin", "main"):
            # Similar to above, consider rollback or cleanup.
            raise HTTPException(status_code=500, detail="Failed to push to remote 'origin main'.")

        return RepoResponse(
            message=f"Repository '{request.project_path}' exported successfully to GitHub as '{request.repo_name}'.",
            html_url=html_url,
            clone_url=clone_url,
            details=f"GitHub repository '{html_url}' created and local project pushed."
        )

    except HTTPException:
        # Re-raise HTTPExceptions directly
        raise
    except Exception as e:
        # Catch any other unexpected errors
        raise HTTPException(status_code=500, detail=f"An error occurred during repository export: {str(e)}")
