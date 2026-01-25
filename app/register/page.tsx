"use client";

import { RegistrationProvider } from "@/app/context/RegistrationContext";
import { RegistrationStepper } from "@/app/components/RegistrationStepper";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

function RegisterPageContent() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Join NyasaWave</h1>
          <p className="text-purple-300">Create your account and start making waves</p>
        </div>

        {/* Registration Stepper */}
        <RegistrationStepper />

        {/* Sign In Link */}
        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{" "}
            <a href="/signin" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <RegistrationProvider>
      <RegisterPageContent />
    </RegistrationProvider>
  );
}
