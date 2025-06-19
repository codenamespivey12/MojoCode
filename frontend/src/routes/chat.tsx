import React from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { ConversationInterface } from "#/components/conversations";

export default function ChatPage() {
  return (
    <>
      <SignedIn>
        <div className="h-screen bg-base-secondary">
          <ConversationInterface />
        </div>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
