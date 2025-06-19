import React from "react";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
import { useConfig } from "#/hooks/query/use-config";
import { useSettings } from "#/hooks/query/use-settings";
import { BrandButton } from "#/components/features/settings/brand-button";
import { useLogout } from "#/hooks/mutation/use-logout";
import { GitHubTokenInput } from "#/components/features/settings/git-settings/github-token-input";

import { ConfigureGitHubRepositoriesAnchor } from "#/components/features/settings/git-settings/configure-github-repositories-anchor";
import { InstallSlackAppAnchor } from "#/components/features/settings/git-settings/install-slack-app-anchor";
import { I18nKey } from "#/i18n/declaration";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";
import { retrieveAxiosErrorMessage } from "#/utils/retrieve-axios-error-message";
import { GitSettingInputsSkeleton } from "#/components/features/settings/git-settings/github-settings-inputs-skeleton";
import { useAddGitProviders } from "#/hooks/mutation/use-add-git-providers";
import { useUserProviders } from "#/hooks/use-user-providers";
import { openHands } from "#/api/open-hands-axios"; // Added for API call

const GIT_REPO_EXTENSION = ".git";

function GitSettingsScreen() {
  const { t } = useTranslation();

  const { mutate: saveGitProviders, isPending } = useAddGitProviders();
  const { mutate: disconnectGitTokens } = useLogout();

  const { data: settings, isLoading } = useSettings();
  const { providers } = useUserProviders();

  const { data: config } = useConfig();

  const [githubTokenInputHasValue, setGithubTokenInputHasValue] =
    React.useState(false);
  const [githubHostInputHasValue, setGithubHostInputHasValue] =
    React.useState(false);

  // State for the new import repository section
  const [importRepoUrl, setImportRepoUrl] = React.useState("");
  const [isImporting, setIsImporting] = React.useState(false);

  // State for the new export repository section
  const [exportRepoName, setExportRepoName] = React.useState("");
  const [exportProjectPath, setExportProjectPath] = React.useState("");
  const [exportRepoDescription, setExportRepoDescription] = React.useState("");
  const [exportRepoPrivate, setExportRepoPrivate] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);

  const existingGithubHost = settings?.PROVIDER_TOKENS_SET.github;

  const isSaas = config?.APP_MODE === "saas";
  const isGitHubTokenSet = providers.includes("github");

  // Handler for importing repository
  const handleImportRepository = async () => {
    if (!importRepoUrl.trim() || !importRepoUrl.endsWith(GIT_REPO_EXTENSION)) {
      displayErrorToast(t(I18nKey.SETTINGS$IMPORT_REPO_INVALID_URL_ERROR));
      return;
    }
    setIsImporting(true);
    try {
      const response = await openHands.post("/api/v1/repository/import", {
        repo_url: importRepoUrl,
      });
      displaySuccessToast(
        t(
          // I18nKey.TOAST_MESSAGE$IMPORT_SUCCESS || // Placeholder for I18n key
          "Repository import started successfully: {details}",
          { details: response.data.details || "" },
        ),
      );
      setImportRepoUrl(""); // Clear input on success
    } catch (error) {
      const errorMessage = retrieveAxiosErrorMessage(error as AxiosError);
      displayErrorToast(
        errorMessage ||
          t(
            // I18nKey.TOAST_MESSAGE$IMPORT_FAILURE || // Placeholder for I18n key
            "Failed to import repository.",
          ),
      );
    } finally {
      setIsImporting(false);
    }
  };

  // Handler for exporting repository
  const handleExportRepository = async () => {
    if (!exportRepoName.trim()) {
      displayErrorToast(
        t(
          // I18nKey.SETTINGS$EXPORT_REPO_NAME_REQUIRED_ERROR || // Placeholder
          "Repository name is required.",
        ),
      );
      return;
    }
    if (!exportProjectPath.trim()) {
      displayErrorToast(
        t(
          // I18nKey.SETTINGS$EXPORT_PROJECT_PATH_REQUIRED_ERROR || // Placeholder
          "Project path is required.",
        ),
      );
      return;
    }

    setIsExporting(true);
    try {
      const response = await openHands.post("/api/v1/repository/export", {
        project_path: exportProjectPath,
        repo_name: exportRepoName,
        description: exportRepoDescription,
        private: exportRepoPrivate,
      });
      displaySuccessToast(
        t(
          // I18nKey.TOAST_MESSAGE$EXPORT_SUCCESS || // Placeholder
          "Successfully created GitHub repository: {html_url}",
          { html_url: response.data.html_url || "" },
        ),
      );
      setExportRepoName("");
      setExportProjectPath("");
      setExportRepoDescription("");
      setExportRepoPrivate(false);
    } catch (error) {
      const errorMessage = retrieveAxiosErrorMessage(error as AxiosError);
      displayErrorToast(
        errorMessage ||
          t(
            // I18nKey.TOAST_MESSAGE$EXPORT_FAILURE || // Placeholder
            "Failed to export repository.",
          ),
      );
    } finally {
      setIsExporting(false);
    }
  };

  const formAction = async (formData: FormData) => {
    const disconnectButtonClicked =
      formData.get("disconnect-tokens-button") !== null;

    if (disconnectButtonClicked) {
      disconnectGitTokens();
      return;
    }

    const githubToken = formData.get("github-token-input")?.toString() || "";
    const githubHost = formData.get("github-host-input")?.toString() || "";

    saveGitProviders(
      {
        github: { token: githubToken, host: githubHost },
      },
      {
        onSuccess: () => {
          displaySuccessToast(t(I18nKey.SETTINGS$SAVED));
          setGithubTokenInputHasValue(false);
          setGithubHostInputHasValue(false);
        },
        onError: (error) => {
          const errorMessage = retrieveAxiosErrorMessage(error);
          displayErrorToast(errorMessage || t(I18nKey.ERROR$GENERIC));
        },
      },
    );
  };

  const formIsClean = !githubTokenInputHasValue && !githubHostInputHasValue;
  const shouldRenderExternalConfigureButtons = isSaas && config.APP_SLUG;

  return (
    <form
      data-testid="git-settings-screen"
      action={formAction}
      className="flex flex-col h-full justify-between"
    >
      {!isLoading && (
        <div className="p-9 flex flex-col gap-12">
          {shouldRenderExternalConfigureButtons && !isLoading && (
            <ConfigureGitHubRepositoriesAnchor slug={config.APP_SLUG!} />
          )}

          {shouldRenderExternalConfigureButtons && !isLoading && (
            <InstallSlackAppAnchor />
          )}

          {!isSaas && (
            <GitHubTokenInput
              name="github-token-input"
              isGitHubTokenSet={isGitHubTokenSet}
              onChange={(value) => {
                setGithubTokenInputHasValue(!!value);
              }}
              onGitHubHostChange={(value) => {
                setGithubHostInputHasValue(!!value);
              }}
              githubHostSet={existingGithubHost}
            />
          )}

          {/* New Import GitHub Repository Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-medium text-label">
              {t(
                // I18nKey.SETTINGS$IMPORT_REPO_TITLE || // Placeholder for I18n key
                "Import GitHub Repository",
              )}
            </h3>
            <p className="text-sm text-secondary">
              {t(I18nKey.SETTINGS$IMPORT_REPO_DESCRIPTION)}
            </p>
            {/* Basic styled input, replace with TextInput if available and preferred */}
            <input
              type="text"
              name="import-repo-url-input"
              data-testid="import-repo-url-input"
              value={importRepoUrl}
              onChange={(e) => setImportRepoUrl(e.target.value)}
              placeholder={t(I18nKey.SETTINGS$IMPORT_REPO_PLACEHOLDER)}
              className="bg-input border border-input-border text-text rounded-md p-2 focus:ring-accent focus:border-accent"
              disabled={isImporting}
            />
            <div className="flex justify-start">
              <BrandButton
                testId="import-repository-button"
                variant="primary"
                type="button"
                onClick={handleImportRepository}
                isDisabled={
                  !importRepoUrl.trim() ||
                  isImporting ||
                  !importRepoUrl.endsWith(GIT_REPO_EXTENSION)
                }
              >
                {isImporting
                  ? t(
                      // I18nKey.SETTINGS$IMPORTING_REPO_BUTTON || // Placeholder for I18n key
                      "Importing...",
                    )
                  : t(
                      // I18nKey.SETTINGS$IMPORT_REPO_BUTTON || // Placeholder for I18n key
                      "Import Repository",
                    )}
              </BrandButton>
            </div>
          </div>

          {/* New Export Project to GitHub Repository Section */}
          <div className="flex flex-col gap-4 pt-8">
            <h3 className="text-lg font-medium text-label">
              {t(
                // I18nKey.SETTINGS$EXPORT_REPO_TITLE || // Placeholder
                "Export Project to New GitHub Repository",
              )}
            </h3>
            <p className="text-sm text-secondary">
              {t(
                // I18nKey.SETTINGS$EXPORT_REPO_DESCRIPTION_TEXT || // Placeholder
                "This will initialize a new Git repository in your specified local project path, create a new repository on GitHub, and push your project to it. Project path should be relative to your workspace root (e.g., 'my_project' or 'folder/my_project').",
              )}
            </p>

            <label
              htmlFor="export-repo-name-input"
              className="text-sm font-medium text-label"
            >
              {t(
                // I18nKey.SETTINGS$EXPORT_NEW_REPO_NAME_LABEL || // Placeholder
                "New GitHub Repository Name (Required)",
              )}
            </label>
            <input
              type="text"
              id="export-repo-name-input"
              name="export-repo-name-input"
              data-testid="export-repo-name-input"
              value={exportRepoName}
              onChange={(e) => setExportRepoName(e.target.value)}
              className="bg-input border border-input-border text-text rounded-md p-2 focus:ring-accent focus:border-accent"
              disabled={isExporting}
            />

            <label
              htmlFor="export-project-path-input"
              className="text-sm font-medium text-label mt-2"
            >
              {t(
                // I18nKey.SETTINGS$EXPORT_PROJECT_PATH_LABEL || // Placeholder
                "Project Path in Workspace (Required)",
              )}
            </label>
            <input
              type="text"
              id="export-project-path-input"
              name="export-project-path-input"
              data-testid="export-project-path-input"
              value={exportProjectPath}
              onChange={(e) => setExportProjectPath(e.target.value)}
              placeholder={t(
                // I18nKey.SETTINGS$EXPORT_PROJECT_PATH_PLACEHOLDER || // Placeholder
                "e.g., my_existing_project_folder",
              )}
              className="bg-input border border-input-border text-text rounded-md p-2 focus:ring-accent focus:border-accent"
              disabled={isExporting}
            />

            <label
              htmlFor="export-repo-description-input"
              className="text-sm font-medium text-label mt-2"
            >
              {t(
                // I18nKey.SETTINGS$EXPORT_REPO_DESCRIPTION_LABEL || // Placeholder
                "Repository Description (Optional)",
              )}
            </label>
            <input
              type="text"
              id="export-repo-description-input"
              name="export-repo-description-input"
              data-testid="export-repo-description-input"
              value={exportRepoDescription}
              onChange={(e) => setExportRepoDescription(e.target.value)}
              className="bg-input border border-input-border text-text rounded-md p-2 focus:ring-accent focus:border-accent"
              disabled={isExporting}
            />

            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="export-repo-private-checkbox"
                name="export-repo-private-checkbox"
                data-testid="export-repo-private-checkbox"
                checked={exportRepoPrivate}
                onChange={(e) => setExportRepoPrivate(e.target.checked)}
                className="h-4 w-4 text-accent focus:ring-accent border-input-border rounded"
                disabled={isExporting}
              />
              <label
                htmlFor="export-repo-private-checkbox"
                className="ml-2 text-sm text-label"
              >
                {t(
                  // I18nKey.SETTINGS$EXPORT_PRIVATE_REPO_LABEL || // Placeholder
                  "Create as Private Repository",
                )}
              </label>
            </div>

            <div className="flex justify-start mt-4">
              <BrandButton
                testId="export-repository-button"
                variant="primary"
                type="button"
                onClick={handleExportRepository}
                isDisabled={
                  !exportRepoName.trim() ||
                  !exportProjectPath.trim() ||
                  isExporting
                }
              >
                {isExporting
                  ? t(
                      // I18nKey.SETTINGS$EXPORTING_REPO_BUTTON || // Placeholder
                      "Exporting...",
                    )
                  : t(
                      // I18nKey.SETTINGS$EXPORT_REPO_BUTTON || // Placeholder
                      "Export to GitHub",
                    )}
              </BrandButton>
            </div>
          </div>
        </div>
      )}

      {isLoading && <GitSettingInputsSkeleton />}

      <div className="flex gap-6 p-6 justify-end border-t border-t-tertiary">
        {!shouldRenderExternalConfigureButtons && (
          <>
            <BrandButton
              testId="disconnect-tokens-button"
              name="disconnect-tokens-button"
              type="submit"
              variant="secondary"
              isDisabled={!isGitHubTokenSet}
            >
              Disconnect Tokens
            </BrandButton>
            <BrandButton
              testId="submit-button"
              type="submit"
              variant="primary"
              isDisabled={isPending || formIsClean}
            >
              {!isPending && t("SETTINGS$SAVE_CHANGES")}
              {isPending && t("SETTINGS$SAVING")}
            </BrandButton>
          </>
        )}
      </div>
    </form>
  );
}

export default GitSettingsScreen;
