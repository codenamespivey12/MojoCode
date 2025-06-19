import React from "react";
import { useTranslation } from "react-i18next";
import { Spinner } from "@heroui/react";

export function BranchLoadingState() {
  const { t } = useTranslation();
  return (
    <div
      data-testid="branch-dropdown-loading"
      className="flex items-center gap-2 max-w-[500px] h-10 px-3 bg-tertiary border border-neutral-600 rounded-sm"
    >
      <Spinner size="sm" />
      <span className="text-sm text-content">{t("HOME$LOADING_BRANCHES")}</span>
    </div>
  );
}
