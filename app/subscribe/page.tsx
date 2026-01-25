"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SubscriptionPlans from "@/app/components/SubscriptionPlans";

export default function SubscribePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    // Redirect unauthenticated users to sign in
    if (status === "unauthenticated") {
      router.push("/signin");
      return;
    }

    if (status === "authenticated") {
      setIsAuthenticating(false);
    }
  }, [status, router]);

  if (isAuthenticating || status === "loading") {
    return (
      <main className="min-h-screen bg-gradient-to-b from-black to-gray-900 pt-32 pb-16 px-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg mt-4">Loading subscription plans...</p>
        </div>
      </main>
    );
  }
}
