import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const sendMagicLink = async (email: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/landing` },
    });
    return error ? { error: error.message } : {};
  };

  const logout = () => supabase.auth.signOut();

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    sendMagicLink,
    logout,
    isLoggingOut: false,
  };
}
