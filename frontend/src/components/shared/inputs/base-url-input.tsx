import { Input } from "@heroui/react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";

interface BaseUrlInputProps {
  isDisabled: boolean;
  defaultValue: string;
}

export function BaseUrlInput({ isDisabled, defaultValue }: BaseUrlInputProps) {
  const { t } = useTranslation();

  return (
    <fieldset className="flex flex-col gap-2">
      <label htmlFor="base-url" className="font-[500] text-neutral-400 text-xs">
        {t(I18nKey.SETTINGS_FORM$BASE_URL_LABEL)}
      </label>
      <Input
        isDisabled={isDisabled}
        id="base-url"
        name="base-url"
        defaultValue={defaultValue}
        aria-label={t(I18nKey.SETTINGS_FORM$BASE_URL)}
        classNames={{
          inputWrapper: "bg-neutral-800 rounded-md text-sm px-3 py-[10px]",
        }}
      />
    </fieldset>
  );
}
