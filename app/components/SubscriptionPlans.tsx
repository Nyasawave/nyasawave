"use client";

/**
 * SUBSCRIPTION PLANS COMPONENT
 * 
 * Displays pricing tiers for premium subscriptions
 * Allows users to select and proceed to checkout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./SubscriptionPlans.module.css";

interface PlanProps {
    id: string;
    name: string;
    price: number;
    interval: string;
    description: string;
    features: string[];
    isPopular?: boolean;
    isSelected?: boolean;
    onSelect: () => void;
}

const PlanCard: React.FC<PlanProps> = ({
    name,
    price,
    interval,
    description,
    features,
    isPopular,
    isSelected,
    onSelect,
}) => (
    <div className={`${styles.card} ${isPopular ? styles.popular : ""} ${isSelected ? styles.selected : ""}`}>
        {isPopular && <div className={styles.popularBadge}>Most Popular</div>}

        <h3 className={styles.planName}>{name}</h3>
        <p className={styles.description}>{description}</p>

        <div className={styles.pricing}>
            <span className={styles.amount}>${(price / 100).toFixed(2)}</span>
            <span className={styles.interval}>/{interval}</span>
        </div>

        <button
            className={`${styles.selectButton} ${isSelected ? styles.selectedButton : ""}`}
            onClick={onSelect}
        >
            {isSelected ? "Selected" : "Choose Plan"}
        </button>

        <ul className={styles.features}>
            {features.map((feature, idx) => (
                <li key={idx} className={styles.feature}>
                    <span className={styles.checkmark}>✓</span>
                    {feature}
                </li>
            ))}
        </ul>
    </div>
);

interface SubscriptionPlansProps {
    onPlanSelected?: (planId: string) => void;
    onCheckoutClick?: (planId: string) => void;
}

const SUBSCRIPTION_PLANS = [
    {
        id: "monthly",
        name: "Premium Monthly",
        price: 999, // $9.99
        interval: "month",
        description: "Perfect for trying premium features",
        features: [
            "Unlimited downloads",
            "Access to tournaments",
            "Priority support",
            "Ad-free listening",
            "High-quality streaming",
        ],
        isPopular: false,
    },
    {
        id: "annual",
        name: "Premium Annual",
        price: 9999, // $99.99
        interval: "year",
        description: "Best value - save 17%",
        features: [
            "Unlimited downloads",
            "Access to tournaments",
            "Priority support",
            "Ad-free listening",
            "High-quality streaming",
            "Exclusive artist early access",
        ],
        isPopular: true,
    },
];

export default function SubscriptionPlans({
    onPlanSelected,
    onCheckoutClick,
}: SubscriptionPlansProps) {
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<string>("annual");
    const [isLoading, setIsLoading] = useState(false);

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
        onPlanSelected?.(planId);
    };

    const handleCheckout = async () => {
        try {
            setIsLoading(true);

            // Call checkout endpoint
            const response = await fetch("/api/payments/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan: selectedPlan,
                    type: "subscription",
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Checkout failed");
            }

            const data = await response.json();

            if (data.redirectUrl) {
                // Redirect to Stripe checkout
                window.location.href = data.redirectUrl;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error) {
            console.error("Checkout error:", error);
            alert(
                error instanceof Error
                    ? error.message
                    : "Failed to start checkout. Please try again."
            );
            setIsLoading(false);
        }
    };

    const selectedPlanData = SUBSCRIPTION_PLANS.find((p) => p.id === selectedPlan);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2>Choose Your Premium Plan</h2>
                <p>
                    Unlock exclusive features and support NyasaWave creators
                </p>
            </div>

            <div className={styles.plans}>
                {SUBSCRIPTION_PLANS.map((plan) => (
                    <PlanCard
                        key={plan.id}
                        {...plan}
                        isSelected={selectedPlan === plan.id}
                        onSelect={() => handlePlanSelect(plan.id)}
                    />
                ))}
            </div>

            <div className={styles.footer}>
                <div className={styles.summary}>
                    <p>
                        You'll be charged{" "}
                        <strong>
                            ${(selectedPlanData?.price || 0) / 100} {" "}
                            {selectedPlanData?.interval === "month"
                                ? "per month"
                                : "per year"}
                        </strong>
                    </p>
                    <p className={styles.terms}>
                        Renews automatically. Cancel anytime from settings.
                    </p>
                </div>

                <button
                    className={styles.checkoutButton}
                    onClick={handleCheckout}
                    disabled={isLoading}
                >
                    {isLoading ? "Processing..." : "Proceed to Checkout"}
                </button>

                <button
                    className={styles.backButton}
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                    Go Back
                </button>
            </div>

            <div className={styles.faq}>
                <h3>Frequently Asked Questions</h3>
                <div className={styles.faqItem}>
                    <h4>Can I cancel anytime?</h4>
                    <p>Yes, cancel your subscription anytime from your settings. You'll keep access until your current billing period ends.</p>
                </div>
                <div className={styles.faqItem}>
                    <h4>What payment methods do you accept?</h4>
                    <p>We accept all major credit and debit cards through Stripe.</p>
                </div>
                <div className={styles.faqItem}>
                    <h4>Is there a free trial?</h4>
                    <p>Contact support@nyasawave.com for trial availability.</p>
                </div>
            </div>
        </div>
    );
}
