"use client";

/**
 * CHECKOUT FORM COMPONENT
 * 
 * Handles card payment using Stripe Elements
 * Integrated into checkout pages
 */

import { useState, useEffect } from "react";
import {
    useStripe,
    useElements,
    CardElement,
    Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import styles from "./CheckoutForm.module.css";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "");

interface CheckoutFormProps {
    onSuccess?: () => void;
    onError?: (error: string) => void;
    planId?: string;
    amount?: number;
}

function CheckoutFormContent({
    onSuccess,
    onError,
    planId = "monthly",
    amount = 999,
}: CheckoutFormProps) {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Create payment method
            const { error: methodError, paymentMethod } =
                await stripe.createPaymentMethod({
                    type: "card",
                    card: elements.getElement(CardElement)!,
                    billing_details: {
                        name,
                        email,
                    },
                });

            if (methodError) {
                setError(methodError.message || "Payment failed");
                onError?.(methodError.message || "Payment failed");
                setIsLoading(false);
                return;
            }

            // Create checkout session with payment method
            const response = await fetch("/api/payments/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    plan: planId,
                    type: "subscription",
                    paymentMethodId: paymentMethod?.id,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(
                    data.error || "Failed to create checkout session"
                );
            }

            const data = await response.json();

            if (data.success) {
                onSuccess?.();
                // Redirect or show success message
                window.location.href = data.redirectUrl;
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Payment failed";
            setError(message);
            onError?.(message);
        } finally {
            setIsLoading(false);
        }
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                    color: "#aab7c4",
                },
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        },
    };

    return (
        <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.section}>
                <h2>Billing Information</h2>

                <div className={styles.formGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="John Doe"
                        required
                        disabled={isLoading}
                    />
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="john@example.com"
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className={styles.section}>
                <h2>Card Details</h2>

                <div className={styles.formGroup}>
                    <label>Card Information</label>
                    <div className={styles.cardElement}>
                        <CardElement options={cardElementOptions} />
                    </div>
                </div>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.summary}>
                <p>
                    Total: <strong>${(amount / 100).toFixed(2)}</strong>
                </p>
                <p className={styles.terms}>
                    By confirming your payment, you agree to our Terms of Service
                </p>
            </div>

            <button
                type="submit"
                disabled={isLoading || !stripe || !elements}
                className={styles.submitButton}
            >
                {isLoading ? "Processing..." : "Complete Payment"}
            </button>

            <p className={styles.secure}>
                🔒 Your payment is secure and encrypted
            </p>
        </form>
    );
}

export default function CheckoutForm(props: CheckoutFormProps) {
    return (
        <Elements stripe={stripePromise}>
            <CheckoutFormContent {...props} />
        </Elements>
    );
}
