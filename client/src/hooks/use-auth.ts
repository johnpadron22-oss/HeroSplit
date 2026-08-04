import { useEffect } from "react";
import { db } from "@/lib/db";

const REDIRECT_URL = `${window.location.origin}/landing`;

export function useAuth() {
  const { user, isLoading } = db.useAuth();

  // Handle OAuth callback — exchange code for token when Google redirects back
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    db.auth
      .exchangeCodeForToken({ code, redirectURL: REDIRECT_URL })
      .then(() => {
        window.history.replaceState({}, "", window.location.pathname);
      })
      .catch(console.error);
  }, []);

  const loginWithGoogle = async () => {
    const url = await db.auth.createAuthorizationURL({
      clientName: "google-web2",
      redirectURL: REDIRECT_URL,
    });
    window.location.href = url;
  };

  const logout = () => db.auth.signOut();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginWithGoogle,
    logout,
    isLoggingOut: false,
  };
}
