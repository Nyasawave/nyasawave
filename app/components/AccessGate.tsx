"use client";

import React from "react";
import Link from "next/link";
import { useAccessControl } from "@/app/hooks/useAccessControl";
import { formatAccessDenial } from "@/app/utils/accessControl";
import type { AccessCheckParams } from "@/app/utils/accessControl";

interface AccessGateProps {
    action: AccessCheckParams["action"];
    resourceType?: AccessCheckParams["resourceType"];
    isTournament?: boolean;
    resourceOwnerId?: string;
    children: React.ReactNode;
    fallbackUI?: React.ReactNode;
}

/**
 * ACCESS GATE COMPONENT
 * 
 * Conditionally renders content based on user permissions
 * Shows appropriate gate (login, premium, etc.) if access denied
 * 
 * Usage:
 * <AccessGate action="download">
 *   <DownloadButton />
 * </AccessGate>
 */

export default function AccessGate({
    action,
    resourceType,
    isTournament,
    resourceOwnerId,
    children,
    fallbackUI,
}: AccessGateProps) {
    const { check } = useAccessControl();

    const result = check({
        action,
        resourceType,
        isTournament,
        resourceOwnerId,
    });

    if (result.allowed) {
        return <>{children}</>;
    }

    // Custom fallback if provided
    if (fallbackUI) {
        return <>{fallbackUI}</>;
    }

    // Default gates based on required condition
    return (
        <DefaultAccessGate
            action={action}
            reason={result.reason}
            suggestedAction={result.suggestedAction}
        />
    );
}

interface DefaultAccessGateProps {
    action: string;
    reason?: string;
    suggestedAction?: "signin" | "upgrade_premium" | "insufficient_role";
}

function DefaultAccessGate({
    action,
    reason,
    suggestedAction,
}: DefaultAccessGateProps) {
    const actionLabels: Record<string, string> = {
        download: "Download",
        comment: "Comment",
        join_tournament: "Join Tournament",
        list_marketplace: "List on Marketplace",
        create_campaign: "Create Campaign",
    };

    const label = actionLabels[action] || action;

    if (suggestedAction === "signin") {
        return (
            <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg text-center">
                <p className="text-zinc-300 mb-3">{reason || `Sign in to ${label}`}</p>
                <Link
                    href="/signin"
                    className="inline-block px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition"
                >
                    Sign In
                </Link>
            </div>
        );
    }

    if (suggestedAction === "upgrade_premium") {
        return (
            <div className="p-4 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-700 rounded-lg text-center">
                <p className="text-zinc-300 mb-3">
                    {reason || `Premium subscription required to ${label}`}
                </p>
                <Link
                    href="/subscribe"
                    className="inline-block px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                >
                    Upgrade to Premium
                </Link>
            </div>
        );
    }

    if (suggestedAction === "insufficient_role") {
        return (
            <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg text-center">
                <p className="text-zinc-300">
                    {reason || `You don't have the required role to ${label}`}
                </p>
            </div>
        );
    }

    // Generic gate
    return (
        <div className="p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg text-center">
            <p className="text-zinc-300">{reason || `Access denied for ${label}`}</p>
        </div>
    );
}
