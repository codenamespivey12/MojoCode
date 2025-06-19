import React from "react";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";
import { useTranslation } from "react-i18next";
import { I18nKey } from "#/i18n/declaration";

export function UserActions() {
  const { t } = useTranslation();

  return (
    <div data-testid="user-actions" className="flex items-center">
      <SignedOut>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t(I18nKey.AUTH$SIGN_IN)}
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {t(I18nKey.AUTH$SIGN_UP)}
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="w-8 h-8 relative">
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
}
