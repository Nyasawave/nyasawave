"use client";

import React, { createContext, useContext, useState } from "react";

export type UserRole = "ARTIST" | "LISTENER" | "ENTREPRENEUR" | "MARKETER";

export interface RegistrationData {
    // Step 1: Role Selection
    primaryRole: UserRole | null;

    // Step 2: Personal Details
    personalDetails: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        country: string;
        city: string;
        password: string;
        acceptTerms: boolean;
    };

    // Artist-specific
    artistDetails?: {
        stageName: string;
        genres: string[];
        bio: string;
    };

    // Entrepreneur-specific
    entrepreneurDetails?: {
        businessName: string;
        businessCategory: string;
        businessLocation: string;
    };

    // Marketer-specific
    marketerDetails?: {
        marketingFocus: string;
        platformsUsed: string[];
        portfolioLinks: string[];
    };

    // Step 3: Payment Setup
    paymentSetup?: {
        provider: "stripe" | "flutterwave" | null;
        customerId: string;
        verified: boolean;
    };

    // Step 4: Identity Verification
    identityVerification?: {
        type: "national_id" | "passport" | "drivers_license" | null;
        documentUrl: string;
        verified: boolean;
    };
}

interface RegistrationContextType {
    currentStep: number;
    data: RegistrationData;
    errors: Record<string, string>;
    isSubmitting: boolean;

    // Step navigation
    goToStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    // Data updates
    setRole: (role: UserRole) => void;
    setPersonalDetails: (details: RegistrationData["personalDetails"]) => void;
    setArtistDetails: (details: RegistrationData["artistDetails"]) => void;
    setEntrepreneurDetails: (details: RegistrationData["entrepreneurDetails"]) => void;
    setMarketerDetails: (details: RegistrationData["marketerDetails"]) => void;
    setPaymentSetup: (setup: RegistrationData["paymentSetup"]) => void;
    setIdentityVerification: (verification: RegistrationData["identityVerification"]) => void;

    // Validation & Submission
    validateStep: (step: number) => boolean;
    submit: () => Promise<boolean>;
    setErrors: (errors: Record<string, string>) => void;
}

const RegistrationContext = createContext<RegistrationContextType | undefined>(undefined);

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [data, setData] = useState<RegistrationData>({
        primaryRole: null,
        personalDetails: {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            country: "",
            city: "",
            password: "",
            acceptTerms: false,
        },
    });

    const goToStep = (step: number) => {
        if (step >= 1 && step <= 4) {
            setCurrentStep(step);
        }
    };

    const nextStep = () => {
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const setRole = (role: UserRole) => {
        setData(prev => ({
            ...prev,
            primaryRole: role,
        }));
    };

    const setPersonalDetails = (details: RegistrationData["personalDetails"]) => {
        setData(prev => ({
            ...prev,
            personalDetails: details,
        }));
    };

    const setArtistDetails = (details: RegistrationData["artistDetails"]) => {
        setData(prev => ({
            ...prev,
            artistDetails: details,
        }));
    };

    const setEntrepreneurDetails = (details: RegistrationData["entrepreneurDetails"]) => {
        setData(prev => ({
            ...prev,
            entrepreneurDetails: details,
        }));
    };

    const setMarketerDetails = (details: RegistrationData["marketerDetails"]) => {
        setData(prev => ({
            ...prev,
            marketerDetails: details,
        }));
    };

    const setPaymentSetup = (setup: RegistrationData["paymentSetup"]) => {
        setData(prev => ({
            ...prev,
            paymentSetup: setup,
        }));
    };

    const setIdentityVerification = (verification: RegistrationData["identityVerification"]) => {
        setData(prev => ({
            ...prev,
            identityVerification: verification,
        }));
    };

    const validateStep = (step: number): boolean => {
        const stepErrors: Record<string, string> = {};

        if (step === 1) {
            if (!data.primaryRole) {
                stepErrors.role = "Please select a role";
            }
        }

        if (step === 2) {
            const { firstName, lastName, email, phone, country, city, password, acceptTerms } = data.personalDetails;

            if (!firstName?.trim()) {
                stepErrors.firstName = "First name is required";
            }
            if (!lastName?.trim()) {
                stepErrors.lastName = "Last name is required";
            }
            if (!email?.trim()) {
                stepErrors.email = "Email is required";
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                stepErrors.email = "Invalid email format";
            }
            if (!phone?.trim()) {
                stepErrors.phone = "Phone number is required";
            }
            if (!country?.trim()) {
                stepErrors.country = "Country is required";
            }
            if (!city?.trim()) {
                stepErrors.city = "City is required";
            }
            if (!password || password.length < 8) {
                stepErrors.password = "Password must be at least 8 characters";
            }
            if (!acceptTerms) {
                stepErrors.terms = "You must accept the terms and conditions";
            }

            // Role-specific validation
            if (data.primaryRole === "ARTIST" && data.artistDetails) {
                if (!data.artistDetails.stageName?.trim()) {
                    stepErrors.stageName = "Stage name is required";
                }
            }
            if (data.primaryRole === "ENTREPRENEUR" && data.entrepreneurDetails) {
                if (!data.entrepreneurDetails.businessName?.trim()) {
                    stepErrors.businessName = "Business name is required";
                }
            }
            if (data.primaryRole === "MARKETER" && data.marketerDetails) {
                if (!data.marketerDetails.marketingFocus?.trim()) {
                    stepErrors.marketingFocus = "Marketing focus is required";
                }
            }
        }

        if (step === 3) {
            if (!data.paymentSetup?.provider) {
                stepErrors.provider = "Please select a payment provider";
            }
            if (!data.paymentSetup?.customerId) {
                stepErrors.customerId = "Payment setup is incomplete";
            }
        }

        if (step === 4) {
            if (!data.identityVerification?.type) {
                stepErrors.idType = "Please select an ID type";
            }
            if (!data.identityVerification?.documentUrl) {
                stepErrors.document = "Please upload your ID document";
            }
        }

        setErrors(stepErrors);
        return Object.keys(stepErrors).length === 0;
    };

    const submit = async (): Promise<boolean> => {
        // Validate all steps
        if (!validateStep(2)) return false;
        if (!validateStep(3)) return false;
        if (!validateStep(4)) return false;

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/auth/register/multi-step", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                setErrors({ submit: error.error || "Registration failed" });
                return false;
            }

            const result = await response.json();
            console.log("[REGISTRATION] User created:", result.user);

            // Store user info and redirect to signin
            localStorage.setItem("newUserEmail", data.personalDetails.email);

            return true;
        } catch (error) {
            setErrors({ submit: "An error occurred. Please try again." });
            console.error("[REGISTRATION] Submit error:", error);
            return false;
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <RegistrationContext.Provider
            value={{
                currentStep,
                data,
                errors,
                isSubmitting,
                goToStep,
                nextStep,
                prevStep,
                setRole,
                setPersonalDetails,
                setArtistDetails,
                setEntrepreneurDetails,
                setMarketerDetails,
                setPaymentSetup,
                setIdentityVerification,
                validateStep,
                submit,
                setErrors,
            }}
        >
            {children}
        </RegistrationContext.Provider>
    );
}

export function useRegistration(): RegistrationContextType {
    const context = useContext(RegistrationContext);
    if (!context) {
        throw new Error("useRegistration must be used within RegistrationProvider");
    }
    return context;
}
