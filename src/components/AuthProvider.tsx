"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface AuthContextValue {
  user: User | null;
  owner: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  owner: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(true);

  // Owner status is decided server-side via the is_owner() RPC (compares the
  // JWT email against the allow-list in the database). The owner emails are
  // never shipped to the browser.
  async function refreshOwner(u: User | null) {
    if (!u) {
      setOwner(false);
      return;
    }
    const { data } = await supabase.rpc("is_owner");
    setOwner(data === true);
  }

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      setUser(data.user ?? null);
      await refreshOwner(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      await refreshOwner(u);
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      owner,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null);
        setOwner(false);
      },
    }),
    [user, owner, loading, supabase],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
