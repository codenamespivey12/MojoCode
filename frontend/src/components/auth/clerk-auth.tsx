import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/clerk-react";

export function ClerkAuth() {
  return (
    <div className="flex items-center gap-4">
      <SignedOut>
        <div className="flex gap-2">
          <SignInButton mode="modal">
            <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button type="button" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Sign Up
            </button>
          </SignUpButton>
        </div>
      </SignedOut>
      <SignedIn>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Welcome back!</span>
          <UserButton afterSignOutUrl="/" />
        </div>
      </SignedIn>
    </div>
  );
}
