import { useTranslation } from "react-i18next";
import MojoCodeLogo from "#/assets/branding/mojo-code-logo.svg?react";
import { I18nKey } from "#/i18n/declaration";
import { TooltipButton } from "./tooltip-button";

export function AllHandsLogoButton() {
  const { t } = useTranslation();

  return (
    <TooltipButton
      tooltip={t(I18nKey.BRANDING$ALL_HANDS_AI)}
      ariaLabel={t(I18nKey.BRANDING$ALL_HANDS_LOGO)}
      navLinkTo="/"
    >
      <MojoCodeLogo width={68} height={20} />
    </TooltipButton>
  );
}
