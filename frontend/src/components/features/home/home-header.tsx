import { useTranslation } from "react-i18next";
import { useCreateConversation } from "#/hooks/mutation/use-create-conversation";
import { useIsCreatingConversation } from "#/hooks/use-is-creating-conversation";
import { BrandButton } from "../settings/brand-button";
import MojoCodeLogo from "#/assets/branding/mojo-code-logo.svg?react";

export function HomeHeader() {
  const {
    mutate: createConversation,
    isPending,
    isSuccess,
  } = useCreateConversation();
  const isCreatingConversationElsewhere = useIsCreatingConversation();
  const { t } = useTranslation();

  // We check for isSuccess because the app might require time to render
  // into the new conversation screen after the conversation is created.
  const isCreatingConversation =
    isPending || isSuccess || isCreatingConversationElsewhere;

  return (
    <header className="flex flex-col gap-5">
      <MojoCodeLogo width={136} height={40} />

      <div className="flex items-center justify-between">
        <h1 className="heading text-content-2">
          {t("HOME$LETS_START_BUILDING")}
        </h1>
        <BrandButton
          testId="header-launch-button"
          variant="primary"
          type="button"
          onClick={() => createConversation({})}
          isDisabled={isCreatingConversation}
        >
          {!isCreatingConversation && t("HOME$LAUNCH_FROM_SCRATCH")}
          {isCreatingConversation && t("HOME$LOADING")}
        </BrandButton>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm max-w-[424px] text-content">
          {t("HOME$OPENHANDS_DESCRIPTION")}
        </p>
      </div>
    </header>
  );
}
