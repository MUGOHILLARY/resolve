import { useEffect } from "react";

import { getSession, onAuthStateChange } from "../services/authService";
import { useAuthStore } from "../store/authStore";

type Props = {
  children: React.ReactNode;
};

export default function AuthProvider({
  children,
}: Props) {
  const setSession = useAuthStore(
    (state) => state.setSession
  );

  const setLoading = useAuthStore(
    (state) => state.setLoading
  );

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        const session = await getSession();

        if (!mounted) return;

        setSession(
          session,
          session?.user ?? null
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initialize();

    const {
      data: { subscription },
    } = onAuthStateChange((_event, session) => {
      setSession(
        session,
        session?.user ?? null
      );
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setLoading, setSession]);

  return <>{children}</>;
}