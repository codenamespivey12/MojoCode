import React from "react";
import { useTranslation } from "react-i18next";
import { AxiosError } from "axios";
// ModelSelector removed - no longer needed since model is hardcoded
import { useAIConfigOptions } from "#/hooks/query/use-ai-config-options";
import { useSettings } from "#/hooks/query/use-settings";
import { hasAdvancedSettingsSet } from "#/utils/has-advanced-settings-set";
import { useSaveSettings } from "#/hooks/mutation/use-save-settings";
import { SettingsSwitch } from "#/components/features/settings/settings-switch";
import { I18nKey } from "#/i18n/declaration";
import { SettingsInput } from "#/components/features/settings/settings-input";
import { HelpLink } from "#/components/features/settings/help-link";
import { BrandButton } from "#/components/features/settings/brand-button";
import {
  displayErrorToast,
  displaySuccessToast,
} from "#/utils/custom-toast-handlers";
import { retrieveAxiosErrorMessage } from "#/utils/retrieve-axios-error-message";
import { SettingsDropdownInput } from "#/components/features/settings/settings-dropdown-input";
import { useConfig } from "#/hooks/query/use-config";
import { isCustomModel } from "#/utils/is-custom-model";
import { LlmSettingsInputsSkeleton } from "#/components/features/settings/llm-settings/llm-settings-inputs-skeleton";
import { KeyStatusIcon } from "#/components/features/settings/key-status-icon";
import { DEFAULT_SETTINGS } from "#/services/settings";

function LlmSettingsScreen() {
  const { t } = useTranslation();

  const { mutate: saveSettings, isPending } = useSaveSettings();

  const { data: resources } = useAIConfigOptions();
  const { data: settings, isFetching } = useSettings();
  const { data: config } = useConfig();

  const [view, setView] = React.useState<"basic" | "advanced">("basic");
  const [securityAnalyzerInputIsVisible, setSecurityAnalyzerInputIsVisible] =
    React.useState(false);

  const [dirtyInputs, setDirtyInputs] = React.useState({
    model: false,
    apiKey: false,
    searchApiKey: false,
    baseUrl: false,
    agent: false,
    confirmationMode: false,
    enableDefaultCondenser: false,
    securityAnalyzer: false,
  });

  // modelsAndProviders removed - no longer needed since model is hardcoded

  React.useEffect(() => {
    const determineWhetherToToggleAdvancedSettings = () => {
      if (resources && settings) {
        return (
          isCustomModel(resources.models, settings.LLM_MODEL) ||
          hasAdvancedSettingsSet({
            ...settings,
          })
        );
      }

      return false;
    };

    const userSettingsIsAdvanced = determineWhetherToToggleAdvancedSettings();
    if (settings) setSecurityAnalyzerInputIsVisible(settings.CONFIRMATION_MODE);

    if (userSettingsIsAdvanced) setView("advanced");
    else setView("basic");
  }, [settings, resources]);

  const handleSuccessfulMutation = () => {
    displaySuccessToast(t(I18nKey.SETTINGS$SAVED));
    setDirtyInputs({
      model: false,
      apiKey: false,
      searchApiKey: false,
      baseUrl: false,
      agent: false,
      confirmationMode: false,
      enableDefaultCondenser: false,
      securityAnalyzer: false,
    });
  };

  const handleErrorMutation = (error: AxiosError) => {
    const errorMessage = retrieveAxiosErrorMessage(error);
    displayErrorToast(errorMessage || t(I18nKey.ERROR$GENERIC));
  };

  const basicFormAction = () => {
    // Hardcoded values - no longer reading from form inputs
    const fullLlmModel = "openai/o4-mini-2025-04-16";
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    const searchApiKey = import.meta.env.VITE_TAVILY_API_KEY || "";

    saveSettings(
      {
        LLM_MODEL: fullLlmModel,
        llm_api_key: apiKey,
        SEARCH_API_KEY: searchApiKey,

        // reset advanced settings
        LLM_BASE_URL: DEFAULT_SETTINGS.LLM_BASE_URL,
        AGENT: DEFAULT_SETTINGS.AGENT,
        CONFIRMATION_MODE: DEFAULT_SETTINGS.CONFIRMATION_MODE,
        SECURITY_ANALYZER: DEFAULT_SETTINGS.SECURITY_ANALYZER,
        ENABLE_DEFAULT_CONDENSER: DEFAULT_SETTINGS.ENABLE_DEFAULT_CONDENSER,
      },
      {
        onSuccess: handleSuccessfulMutation,
        onError: handleErrorMutation,
      },
    );
  };

  const advancedFormAction = (formData: FormData) => {
    // Hardcoded model and API keys - only allow other advanced settings to be modified
    const model = "openai/o4-mini-2025-04-16";
    const baseUrl = formData.get("base-url-input")?.toString();
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
    const searchApiKey = import.meta.env.VITE_TAVILY_API_KEY || "";
    const agent = formData.get("agent-input")?.toString();
    const confirmationMode =
      formData.get("enable-confirmation-mode-switch")?.toString() === "on";
    const enableDefaultCondenser =
      formData.get("enable-memory-condenser-switch")?.toString() === "on";
    const securityAnalyzer = formData
      .get("security-analyzer-input")
      ?.toString();

    saveSettings(
      {
        LLM_MODEL: model,
        LLM_BASE_URL: baseUrl,
        llm_api_key: apiKey,
        SEARCH_API_KEY: searchApiKey,
        AGENT: agent,
        CONFIRMATION_MODE: confirmationMode,
        ENABLE_DEFAULT_CONDENSER: enableDefaultCondenser,
        SECURITY_ANALYZER: confirmationMode ? securityAnalyzer : undefined,
      },
      {
        onSuccess: handleSuccessfulMutation,
        onError: handleErrorMutation,
      },
    );
  };

  const formAction = (formData: FormData) => {
    if (view === "basic") basicFormAction(formData);
    else advancedFormAction(formData);
  };

  const handleToggleAdvancedSettings = (isToggled: boolean) => {
    setSecurityAnalyzerInputIsVisible(!!settings?.CONFIRMATION_MODE);
    setView(isToggled ? "advanced" : "basic");
    setDirtyInputs({
      model: false,
      apiKey: false,
      searchApiKey: false,
      baseUrl: false,
      agent: false,
      confirmationMode: false,
      enableDefaultCondenser: false,
      securityAnalyzer: false,
    });
  };

  // Removed unused dirty handlers since model and API keys are hardcoded

  const handleBaseUrlIsDirty = (baseUrl: string) => {
    const baseUrlIsDirty = baseUrl !== settings?.LLM_BASE_URL;
    setDirtyInputs((prev) => ({
      ...prev,
      baseUrl: baseUrlIsDirty,
    }));
  };

  const handleAgentIsDirty = (agent: string) => {
    const agentIsDirty = agent !== settings?.AGENT && agent !== "";
    setDirtyInputs((prev) => ({
      ...prev,
      agent: agentIsDirty,
    }));
  };

  const handleConfirmationModeIsDirty = (isToggled: boolean) => {
    setSecurityAnalyzerInputIsVisible(isToggled);
    const confirmationModeIsDirty = isToggled !== settings?.CONFIRMATION_MODE;
    setDirtyInputs((prev) => ({
      ...prev,
      confirmationMode: confirmationModeIsDirty,
    }));
  };

  const handleEnableDefaultCondenserIsDirty = (isToggled: boolean) => {
    const enableDefaultCondenserIsDirty =
      isToggled !== settings?.ENABLE_DEFAULT_CONDENSER;
    setDirtyInputs((prev) => ({
      ...prev,
      enableDefaultCondenser: enableDefaultCondenserIsDirty,
    }));
  };

  const handleSecurityAnalyzerIsDirty = (securityAnalyzer: string) => {
    const securityAnalyzerIsDirty =
      securityAnalyzer !== settings?.SECURITY_ANALYZER;
    setDirtyInputs((prev) => ({
      ...prev,
      securityAnalyzer: securityAnalyzerIsDirty,
    }));
  };

  const formIsDirty = Object.values(dirtyInputs).some((isDirty) => isDirty);

  if (!settings || isFetching) return <LlmSettingsInputsSkeleton />;

  return (
    <div data-testid="llm-settings-screen" className="h-full">
      <form
        action={formAction}
        className="flex flex-col h-full justify-between"
      >
        <div className="p-9 flex flex-col gap-6">
          <SettingsSwitch
            testId="advanced-settings-switch"
            defaultIsToggled={view === "advanced"}
            onToggle={handleToggleAdvancedSettings}
            isToggled={view === "advanced"}
          >
            {t(I18nKey.SETTINGS$ADVANCED)}
          </SettingsSwitch>

          {view === "basic" && (
            <div
              data-testid="llm-settings-form-basic"
              className="flex flex-col gap-6"
            >
              {/* Model and API keys are now hardcoded - showing status only */}
              <div className="flex flex-col gap-4">
                <div className="text-sm text-neutral-400">
                  <strong>Model:</strong> OpenAI o4-mini-2025-04-16 (Configured)
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <KeyStatusIcon isSet />
                  <span>
                    OpenAI {t(I18nKey.API$KEY)}:{" "}
                    {t(I18nKey.STATUS$CONFIGURED_VIA_ENVIRONMENT)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <KeyStatusIcon isSet />
                  <span>
                    {t(I18nKey.SETTINGS$SEARCH_API_KEY)}:{" "}
                    {t(I18nKey.STATUS$CONFIGURED_VIA_ENVIRONMENT)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {view === "advanced" && (
            <div
              data-testid="llm-settings-form-advanced"
              className="flex flex-col gap-6"
            >
              {/* Model is hardcoded - showing status only */}
              <div className="flex flex-col gap-4 p-4 bg-neutral-800 rounded-lg">
                <div className="text-sm text-neutral-300">
                  <strong>Model:</strong> openai/o4-mini-2025-04-16 (Hardcoded)
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <KeyStatusIcon isSet />
                  <span>
                    OpenAI {t(I18nKey.API$KEY)}:{" "}
                    {t(I18nKey.STATUS$ENVIRONMENT_VARIABLE)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <KeyStatusIcon isSet />
                  <span>
                    {t(I18nKey.SETTINGS$SEARCH_API_KEY)}:{" "}
                    {t(I18nKey.STATUS$ENVIRONMENT_VARIABLE)}
                  </span>
                </div>
              </div>

              <SettingsInput
                testId="base-url-input"
                name="base-url-input"
                label={t(I18nKey.SETTINGS$BASE_URL)}
                type="text"
                className="w-full max-w-[680px]"
                defaultValue={settings.LLM_BASE_URL || ""}
                onChange={handleBaseUrlIsDirty}
              />

              <HelpLink
                testId="search-api-key-help-anchor"
                text={t(I18nKey.SETTINGS$SEARCH_API_KEY_OPTIONAL)}
                linkText={t(I18nKey.SETTINGS$SEARCH_API_KEY_INSTRUCTIONS)}
                href="https://tavily.com/"
              />

              <SettingsDropdownInput
                testId="agent-input"
                name="agent-input"
                label={t(I18nKey.SETTINGS$AGENT)}
                items={
                  resources?.agents.map((agent) => ({
                    key: agent,
                    label: agent,
                  })) || []
                }
                defaultSelectedKey={settings.AGENT}
                isClearable={false}
                onInputChange={handleAgentIsDirty}
                wrapperClassName="w-full max-w-[680px]"
              />

              {config?.APP_MODE === "saas" && (
                <SettingsDropdownInput
                  testId="runtime-settings-input"
                  name="runtime-settings-input"
                  label={
                    <>
                      {t(I18nKey.SETTINGS$RUNTIME_SETTINGS)}
                      <a href="mailto:contact@all-hands.dev">
                        {t(I18nKey.SETTINGS$GET_IN_TOUCH)}
                      </a>
                    </>
                  }
                  items={[]}
                  isDisabled
                  wrapperClassName="w-full max-w-[680px]"
                />
              )}

              <SettingsSwitch
                testId="enable-memory-condenser-switch"
                name="enable-memory-condenser-switch"
                defaultIsToggled={settings.ENABLE_DEFAULT_CONDENSER}
                onToggle={handleEnableDefaultCondenserIsDirty}
              >
                {t(I18nKey.SETTINGS$ENABLE_MEMORY_CONDENSATION)}
              </SettingsSwitch>

              <SettingsSwitch
                testId="enable-confirmation-mode-switch"
                name="enable-confirmation-mode-switch"
                onToggle={handleConfirmationModeIsDirty}
                defaultIsToggled={settings.CONFIRMATION_MODE}
                isBeta
              >
                {t(I18nKey.SETTINGS$CONFIRMATION_MODE)}
              </SettingsSwitch>

              {securityAnalyzerInputIsVisible && (
                <SettingsDropdownInput
                  testId="security-analyzer-input"
                  name="security-analyzer-input"
                  label={t(I18nKey.SETTINGS$SECURITY_ANALYZER)}
                  items={
                    resources?.securityAnalyzers.map((analyzer) => ({
                      key: analyzer,
                      label: analyzer,
                    })) || []
                  }
                  placeholder={t(
                    I18nKey.SETTINGS$SECURITY_ANALYZER_PLACEHOLDER,
                  )}
                  defaultSelectedKey={settings.SECURITY_ANALYZER}
                  isClearable
                  showOptionalTag
                  onInputChange={handleSecurityAnalyzerIsDirty}
                  wrapperClassName="w-full max-w-[680px]"
                />
              )}
            </div>
          )}
        </div>

        <div className="flex gap-6 p-6 justify-end border-t border-t-tertiary">
          <BrandButton
            testId="submit-button"
            type="submit"
            variant="primary"
            isDisabled={!formIsDirty || isPending}
          >
            {!isPending && t("SETTINGS$SAVE_CHANGES")}
            {isPending && t("SETTINGS$SAVING")}
          </BrandButton>
        </div>
      </form>
    </div>
  );
}

export default LlmSettingsScreen;
