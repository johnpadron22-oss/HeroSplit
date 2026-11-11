import { createContext, useContext, useState, type ReactNode } from "react";

interface PrivacyModeContextValue {
  isPrivate: boolean;
  toggle: () => void;
}

const PrivacyModeContext = createContext<PrivacyModeContextValue>({
  isPrivate: false,
  toggle: () => {},
});

export function PrivacyModeProvider({ children }: { children: ReactNode }) {
  const [isPrivate, setIsPrivate] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem("hs_privacy_v1") === "1";
    } catch {
      return false;
    }
  });

  const toggle = () => {
    setIsPrivate((prev) => {
      const next = !prev;
      try {
        sessionStorage.setItem("hs_privacy_v1", next ? "1" : "0");
      } catch { /* ignore */ }
      return next;
    });
  };

  return (
    <PrivacyModeContext.Provider value={{ isPrivate, toggle }}>
      {children}
    </PrivacyModeContext.Provider>
  );
}

export function usePrivacyMode(): PrivacyModeContextValue {
  return useContext(PrivacyModeContext);
}

/** Returns the value masked as "•••" when privacy mode is on. */
export function masked(value: string | number, isPrivate: boolean): string {
  return isPrivate ? "•••" : String(value);
}
