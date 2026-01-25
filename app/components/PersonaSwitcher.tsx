"use client";

import React, { useState } from "react";
import { usePersonaSwitcher } from "@/app/hooks/usePersonaSwitcher";
import { formatRole } from "@/app/utils/auth";
import type { UserRole } from "@/app/utils/auth";
import styles from "./PersonaSwitcher.module.css";

export default function PersonaSwitcher() {
    const { currentPersona, roles, isLoading, error, switchPersona, hasManyRoles } =
        usePersonaSwitcher();
    const [showDropdown, setShowDropdown] = useState(false);

    if (!hasManyRoles) {
        return null; // Don't show if user only has one role
    }

    const handleSwitchPersona = async (persona: UserRole) => {
        const success = await switchPersona(persona);
        if (success) {
            setShowDropdown(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.switcher}>
                <button
                    className={styles.button}
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={isLoading}
                    title="Switch between your roles"
                >
                    <span className={styles.label}>As:</span>
                    <span className={styles.role}>{formatRole(currentPersona as UserRole)}</span>
                </button>

                {showDropdown && (
                    <div className={styles.dropdown}>
                        {roles?.map((role) => (
                            <button
                                key={role}
                                className={`${styles.option} ${currentPersona === role ? styles.active : ""
                                    }`}
                                onClick={() => handleSwitchPersona(role)}
                                disabled={isLoading || currentPersona === role}
                            >
                                {formatRole(role)}
                            </button>
                        ))}
                    </div>
                )}

                {error && <div className={styles.error}>{error}</div>}
            </div>
        </div>
    );
}
