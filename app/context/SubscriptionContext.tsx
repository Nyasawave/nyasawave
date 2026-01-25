"use client";

import { createContext, useContext, useState } from "react";

export type SubscriptionTier = "free" | "premium" | "business";

export type SubscriptionContextType = {
  tier: SubscriptionTier;
  isPremium: boolean;
  isBusiness: boolean;
  upgradeTo: (newTier: SubscriptionTier) => void;
  downgradeToFree: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTier] = useState<SubscriptionTier>("free");

  const upgradeTo = (newTier: SubscriptionTier) => {
    setTier(newTier);
    if (typeof window !== "undefined") {
      localStorage.setItem("nyasawave_subscription", newTier);
    }
  };

  const downgradeToFree = () => {
    setTier("free");
    if (typeof window !== "undefined") {
      localStorage.setItem("nyasawave_subscription", "free");
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isPremium: tier === "premium",
        isBusiness: tier === "business",
        upgradeTo,
        downgradeToFree,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be used inside SubscriptionProvider");
  return ctx;
};
