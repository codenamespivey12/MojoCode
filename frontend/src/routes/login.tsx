import React, { useState } from "react";
import { useNavigate } from "react-router";
import MojoCodeLogo from "#/assets/branding/mojo-code-logo.svg?react";
import GitHubLogo from "#/assets/branding/github-logo.svg?react";
import GoogleLogo from "#/assets/branding/google-logo.svg?react";
import { BrandButton } from "#/components/features/settings/brand-button";
import { supabase } from "#/utils/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleEmail = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for a login link.");
    }
  };

  const handleOAuth = async (provider: "github" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="border border-tertiary p-8 rounded-lg max-w-md w-full flex flex-col gap-6 items-center bg-base-secondary">
        <MojoCodeLogo width={136} height={40} />
        <h1 className="text-2xl font-bold">Log in or Sign up</h1>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="bg-neutral-800 text-xs py-[10px] px-3 rounded-sm w-full"
        />
        <BrandButton type="button" variant="primary" onClick={handleEmail} className="w-full">
          Continue with Email
        </BrandButton>
        <BrandButton
          type="button"
          variant="secondary"
          onClick={() => handleOAuth("github")}
          className="w-full"
          startContent={<GitHubLogo width={20} height={20} />}
        >
          Continue with GitHub
        </BrandButton>
        <BrandButton
          type="button"
          variant="secondary"
          onClick={() => handleOAuth("google")}
          className="w-full"
          startContent={<GoogleLogo width={20} height={20} />}
        >
          Continue with Google
        </BrandButton>
        {message && <p className="text-sm text-center text-neutral-400">{message}</p>}
      </div>
    </div>
  );
}
