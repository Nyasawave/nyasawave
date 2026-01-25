import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./AdminDashboard.module.css";

/**
 * ADMIN DASHBOARD
 * 
 * Views:
 * - System stats (total users, revenue, tournaments)
 * - User management (list, search, ban/unban)
 * - Tournament management (create, edit, complete, distribute prizes)
 * - Dispute resolution (open disputes, approve/reject)
 * - Payment analytics (daily/weekly/monthly revenue)
 * - Security alerts (fraudulent activity)
 */

interface SystemStats {
    totalUsers: number;
    totalArtists: number;
    totalTournaments: number;
    totalRevenue: number;
    pendingDisputes: number;
}

interface User {
    id: string;
    email: string;
    name: string;
    roles: string[];
    status: "active" | "banned";
    createdAt: string;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"overview" | "users" | "tournaments" | "disputes">(
        "overview"
    );

    // Load stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                const res = await fetch("/api/admin/stats");
                const data = await res.json();
                setStats(data.stats);
            } catch (error) {
                console.error("[ADMIN] Stats error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    // Load users
    useEffect(() => {
        if (tab === "users") {
            const loadUsers = async () => {
                try {
                    const res = await fetch("/api/admin/users");
                    const data = await res.json();
                    setUsers(data.users);
                } catch (error) {
                    console.error("[ADMIN] Users error:", error);
                }
            };

            loadUsers();
        }
    }, [tab]);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Admin Dashboard</h1>
                <p>Platform management & monitoring</p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === "overview" ? styles.active : ""}`}
                    onClick={() => setTab("overview")}
                >
                    📊 Overview
                </button>
                <button
                    className={`${styles.tab} ${tab === "users" ? styles.active : ""}`}
                    onClick={() => setTab("users")}
                >
                    👥 Users
                </button>
                <button
                    className={`${styles.tab} ${tab === "tournaments" ? styles.active : ""}`}
                    onClick={() => setTab("tournaments")}
                >
                    🏆 Tournaments
                </button>
                <button
                    className={`${styles.tab} ${tab === "disputes" ? styles.active : ""}`}
                    onClick={() => setTab("disputes")}
                >
                    ⚖️ Disputes
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {tab === "overview" && stats && (
                    <div className={styles.overview}>
                        {/* Stats grid */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.icon}>👥</div>
                                <div>
                                    <h3>{stats.totalUsers}</h3>
                                    <p>Total Users</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.icon}>🎤</div>
                                <div>
                                    <h3>{stats.totalArtists}</h3>
                                    <p>Artists</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.icon}>🏆</div>
                                <div>
                                    <h3>{stats.totalTournaments}</h3>
                                    <p>Active Tournaments</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.icon}>💰</div>
                                <div>
                                    <h3>${stats.totalRevenue.toFixed(2)}</h3>
                                    <p>Total Revenue</p>
                                </div>
                            </div>
                            <div className={styles.statCard}>
                                <div className={styles.icon}>⚖️</div>
                                <div>
                                    <h3>{stats.pendingDisputes}</h3>
                                    <p>Pending Disputes</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick actions */}
                        <div className={styles.quickActions}>
                            <h3>Quick Actions</h3>
                            <div className={styles.actionGrid}>
                                <Link href="/admin/tournaments/create" className={styles.actionBtn}>
                                    🏆 Create Tournament
                                </Link>
                                <Link href="/admin/users" className={styles.actionBtn}>
                                    👥 Manage Users
                                </Link>
                                <Link href="/admin/disputes" className={styles.actionBtn}>
                                    ⚖️ Review Disputes
                                </Link>
                                <Link href="/admin/analytics" className={styles.actionBtn}>
                                    📈 View Analytics
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "users" && (
                    <div className={styles.users}>
                        <h3>User Management</h3>
                        <div className={styles.usersList}>
                            {users.map(user => (
                                <div key={user.id} className={styles.userItem}>
                                    <div>
                                        <p className={styles.userName}>{user.name}</p>
                                        <p className={styles.userEmail}>{user.email}</p>
                                        <p className={styles.userRoles}>
                                            {user.roles.join(", ")}
                                        </p>
                                    </div>
                                    <div className={styles.userActions}>
                                        <button className={styles.viewBtn}>View</button>
                                        <button
                                            className={`${styles.banBtn} ${user.status === "banned"
                                                    ? styles.unbanBtn
                                                    : ""
                                                }`}
                                        >
                                            {user.status === "banned" ? "Unban" : "Ban"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
