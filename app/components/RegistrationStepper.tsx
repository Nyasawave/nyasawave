"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRegistration } from "@/app/context/RegistrationContext";
import styles from "./RegistrationStepper.module.css";

// Step 1: Role Selection
function RoleSelectionStep() {
    const { data, setRole, nextStep, errors, setErrors } = useRegistration();

    const handleContinue = () => {
        if (!data.primaryRole) {
            setErrors({ primaryRole: "Please select a role" });
            return;
        }
        nextStep();
    };

    const roles = [
        {
            id: "ARTIST",
            label: "Artist",
            description: "Upload music, manage releases, earn from streams",
            icon: "🎵",
        },
        {
            id: "LISTENER",
            label: "Listener",
            description: "Discover music, create playlists, premium downloads",
            icon: "🎧",
        },
        {
            id: "ENTREPRENEUR",
            label: "Seller/Entrepreneur",
            description: "Sell beats, products, services on marketplace",
            icon: "🏪",
        },
        {
            id: "MARKETER",
            label: "Marketer",
            description: "Promote music, create campaigns, reach listeners",
            icon: "📢",
        },
    ];

    return (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <h2>Choose Your Role</h2>
                <p>What would you like to do on NyasaWave?</p>
            </div>

            <div className={styles.rolesGrid}>
                {roles.map(role => (
                    <button
                        key={role.id}
                        className={`${styles.roleCard} ${data.primaryRole === role.id ? styles.selected : ""}`}
                        onClick={() => {
                            setRole(role.id as any);
                            setErrors({});
                        }}
                    >
                        <div className={styles.roleIcon}>{role.icon}</div>
                        <h3>{role.label}</h3>
                        <p>{role.description}</p>
                    </button>
                ))}
            </div>

            {errors.primaryRole && <div className={styles.error}>{errors.primaryRole}</div>}

            <button className={styles.continueBtn} onClick={handleContinue}>
                Continue →
            </button>
        </div>
    );
}

// Step 2: Personal Details
function PersonalDetailsStep() {
    const { data, setPersonalDetails, nextStep, prevStep, errors, setErrors } = useRegistration();
    const [formData, setFormData] = useState(data.personalDetails);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const validateStep = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstName.trim()) newErrors.firstName = "First name required";
        if (!formData.lastName.trim()) newErrors.lastName = "Last name required";
        if (!formData.email.includes("@")) newErrors.email = "Valid email required";
        if (formData.password.length < 6) newErrors.password = "Password must be 6+ characters";
        if (!formData.acceptTerms) newErrors.acceptTerms = "You must accept terms";

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        setPersonalDetails(formData);
        setErrors({});
        return true;
    };

    const handleContinue = () => {
        if (validateStep()) {
            nextStep();
        }
    };

    return (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <h2>Personal Details</h2>
                <p>Tell us about yourself</p>
            </div>

            <form className={styles.form}>
                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="firstName">First Name *</label>
                        <input
                            id="firstName"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="John"
                            className={errors.firstName ? styles.inputError : ""}
                        />
                        {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="lastName">Last Name *</label>
                        <input
                            id="lastName"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Doe"
                            className={errors.lastName ? styles.inputError : ""}
                        />
                        {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address *</label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className={errors.email ? styles.inputError : ""}
                    />
                    {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                </div>

                <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="+265 XX XXX XXXX"
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="country">Country *</label>
                        <select
                            id="country"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            defaultValue="Malawi"
                        >
                            <option value="">Select Country</option>
                            <option value="Malawi">Malawi</option>
                            <option value="Zambia">Zambia</option>
                            <option value="Zimbabwe">Zimbabwe</option>
                            <option value="Tanzania">Tanzania</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="city">City *</label>
                    <input
                        id="city"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Blantyre"
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="password">Password *</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={errors.password ? styles.inputError : ""}
                    />
                    {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
                    <small>Minimum 6 characters</small>
                </div>

                <div className={styles.checkboxGroup}>
                    <label htmlFor="acceptTerms">
                        <input
                            id="acceptTerms"
                            type="checkbox"
                            name="acceptTerms"
                            checked={formData.acceptTerms}
                            onChange={handleChange}
                        />
                        I accept the <a href="/terms">Terms & Conditions</a> *
                    </label>
                    {errors.acceptTerms && <span className={styles.fieldError}>{errors.acceptTerms}</span>}
                </div>
            </form>

            <div className={styles.stepActions}>
                <button className={styles.secondaryBtn} onClick={prevStep}>
                    ← Back
                </button>
                <button className={styles.continueBtn} onClick={handleContinue}>
                    Continue →
                </button>
            </div>
        </div>
    );
}

// Step 3: Role-Specific Details
function RoleDetailsStep() {
    const { data, setArtistDetails, setEntrepreneurDetails, setMarketerDetails, nextStep, prevStep } = useRegistration();
    const [formData, setFormData] = useState(
        data.primaryRole === "ARTIST"
            ? data.artistDetails || { stageName: "", genres: [], bio: "" }
            : data.primaryRole === "ENTREPRENEUR"
                ? data.entrepreneurDetails || { businessName: "", businessCategory: "", businessLocation: "" }
                : data.marketerDetails || { marketingFocus: "", platformsUsed: [], portfolioLinks: [] }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const values = e.target.value.split(",").map(v => v.trim());
        setFormData(prev => ({
            ...prev,
            [field]: values,
        }));
    };

    const handleContinue = () => {
        if (data.primaryRole === "ARTIST") {
            setArtistDetails(formData as any);
        } else if (data.primaryRole === "ENTREPRENEUR") {
            setEntrepreneurDetails(formData as any);
        } else {
            setMarketerDetails(formData as any);
        }
        nextStep();
    };

    return (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <h2>{data.primaryRole === "ARTIST" ? "Artist Details" : data.primaryRole === "ENTREPRENEUR" ? "Business Details" : "Marketing Profile"}</h2>
                <p>Help us customize your experience</p>
            </div>

            <form className={styles.form}>
                {data.primaryRole === "ARTIST" && (
                    <>
                        <div className={styles.formGroup}>
                            <label htmlFor="stageName">Stage Name *</label>
                            <input
                                id="stageName"
                                type="text"
                                name="stageName"
                                value={(formData as any).stageName}
                                onChange={handleChange}
                                placeholder="Your artist name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="genres">Genres (comma-separated)</label>
                            <input
                                id="genres"
                                type="text"
                                placeholder="Hip-Hop, R&B, Reggae"
                                value={(formData as any).genres?.join(", ")}
                                onChange={e => handleArrayChange(e, "genres")}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                id="bio"
                                name="bio"
                                value={(formData as any).bio}
                                onChange={handleChange}
                                placeholder="Tell listeners about your music"
                                rows={4}
                            />
                        </div>
                    </>
                )}

                {data.primaryRole === "ENTREPRENEUR" && (
                    <>
                        <div className={styles.formGroup}>
                            <label htmlFor="businessName">Business Name *</label>
                            <input
                                id="businessName"
                                type="text"
                                name="businessName"
                                value={(formData as any).businessName}
                                onChange={handleChange}
                                placeholder="Your business name"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="businessCategory">Business Category *</label>
                            <select
                                id="businessCategory"
                                name="businessCategory"
                                value={(formData as any).businessCategory}
                                onChange={handleChange}
                            >
                                <option value="">Select Category</option>
                                <option value="beats">Beat Selling</option>
                                <option value="merchandise">Merchandise</option>
                                <option value="services">Services</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="businessLocation">Business Location</label>
                            <input
                                id="businessLocation"
                                type="text"
                                name="businessLocation"
                                value={(formData as any).businessLocation}
                                onChange={handleChange}
                                placeholder="Blantyre, Malawi"
                            />
                        </div>
                    </>
                )}

                {data.primaryRole === "MARKETER" && (
                    <>
                        <div className={styles.formGroup}>
                            <label htmlFor="marketingFocus">Marketing Focus *</label>
                            <input
                                id="marketingFocus"
                                type="text"
                                name="marketingFocus"
                                value={(formData as any).marketingFocus}
                                onChange={handleChange}
                                placeholder="e.g., Social Media, Advertising"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="platformsUsed">Platforms Used (comma-separated)</label>
                            <input
                                id="platformsUsed"
                                type="text"
                                placeholder="Facebook, TikTok, Instagram"
                                value={(formData as any).platformsUsed?.join(", ")}
                                onChange={e => handleArrayChange(e, "platformsUsed")}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="portfolioLinks">Portfolio Links (comma-separated)</label>
                            <input
                                id="portfolioLinks"
                                type="text"
                                placeholder="https://example1.com, https://example2.com"
                                value={(formData as any).portfolioLinks?.join(", ")}
                                onChange={e => handleArrayChange(e, "portfolioLinks")}
                            />
                        </div>
                    </>
                )}
            </form>

            <div className={styles.stepActions}>
                <button className={styles.secondaryBtn} onClick={prevStep}>
                    ← Back
                </button>
                <button className={styles.continueBtn} onClick={handleContinue}>
                    Continue →
                </button>
            </div>
        </div>
    );
}

// Step 4: Payment Setup (Optional for now - can be completed later)
function PaymentSetupStep() {
    const { data, setPaymentSetup, submit, isSubmitting } = useRegistration();
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSkip = async () => {
        setPaymentSetup({
            provider: null,
            customerId: "",
            verified: false,
        });

        // Submit registration
        const success = await submit();
        if (success) {
            router.push("/signin?registered=true");
        } else {
            setError("Failed to complete registration. Please try again.");
        }
    };

    const handleStripeSetup = async () => {
        setPaymentSetup({
            provider: "stripe",
            customerId: "",
            verified: false,
        });

        const success = await submit();
        if (success) {
            router.push("/signin?registered=true");
        } else {
            setError("Failed to complete registration. Please try again.");
        }
    };

    const handleFlutterwaveSetup = async () => {
        setPaymentSetup({
            provider: "flutterwave",
            customerId: "",
            verified: false,
        });

        const success = await submit();
        if (success) {
            router.push("/signin?registered=true");
        } else {
            setError("Failed to complete registration. Please try again.");
        }
    };

    return (
        <div className={styles.stepContainer}>
            <div className={styles.stepHeader}>
                <h2>Payment Setup (Optional)</h2>
                <p>Add payment methods for subscriptions and earnings</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.paymentOptions}>
                <button
                    className={styles.paymentCard}
                    onClick={handleStripeSetup}
                    disabled={isSubmitting}
                >
                    <div className={styles.paymentIcon}>💳</div>
                    <h3>Stripe</h3>
                    <p>International payments, card processing</p>
                </button>

                <button
                    className={styles.paymentCard}
                    onClick={handleFlutterwaveSetup}
                    disabled={isSubmitting}
                >
                    <div className={styles.paymentIcon}>📱</div>
                    <h3>Flutterwave</h3>
                    <p>Mobile money, local payments</p>
                </button>
            </div>

            <button
                className={styles.tertiaryBtn}
                onClick={handleSkip}
                disabled={isSubmitting}
            >
                {isSubmitting ? "Creating account..." : "Skip for now"}
            </button>
        </div>
    );
}

// Progress Indicator
function ProgressIndicator({ currentStep }: { currentStep: number }) {
    const steps = ["Role", "Details", "Profile", "Payment"];
    return (
        <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(currentStep / steps.length) * 100}%` }}
                />
            </div>
            <div className={styles.stepLabels}>
                {steps.map((label, idx) => (
                    <div
                        key={idx}
                        className={`${styles.stepLabel} ${idx + 1 === currentStep ? styles.active : ""} ${idx + 1 < currentStep ? styles.completed : ""}`}
                    >
                        {idx + 1 < currentStep ? "✓" : idx + 1}
                    </div>
                ))}
            </div>
        </div>
    );
}

// Main Stepper Component
export function RegistrationStepper() {
    const { currentStep } = useRegistration();

    return (
        <div className={styles.stepper}>
            <ProgressIndicator currentStep={currentStep} />

            <div className={styles.stepContent}>
                {currentStep === 1 && <RoleSelectionStep />}
                {currentStep === 2 && <PersonalDetailsStep />}
                {currentStep === 3 && <RoleDetailsStep />}
                {currentStep === 4 && <PaymentSetupStep />}
            </div>
        </div>
    );
}
