import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./ListenerDashboard.module.css";

/**
 * LISTENER DASHBOARD
 * 
 * Views:
 * - My playlists
 * - Favorite artists
 * - Download history
 * - Listening history
 * - Subscription status
 */

export default function ListenerDashboard() {
    const { data: session } = useSession();
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"playlists" | "favorites" | "downloads" | "subscription">(
        "playlists"
    );

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <h1>My Library</h1>
                <p>Manage your music and preferences</p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === "playlists" ? styles.active : ""}`}
                    onClick={() => setTab("playlists")}
                >
                    🎵 Playlists
                </button>
                <button
                    className={`${styles.tab} ${tab === "favorites" ? styles.active : ""}`}
                    onClick={() => setTab("favorites")}
                >
                    ❤️ Favorites
                </button>
                <button
                    className={`${styles.tab} ${tab === "downloads" ? styles.active : ""}`}
                    onClick={() => setTab("downloads")}
                >
                    📥 Downloads
                </button>
                <button
                    className={`${styles.tab} ${tab === "subscription" ? styles.active : ""}`}
                    onClick={() => setTab("subscription")}
                >
                    💎 Subscription
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {tab === "playlists" && (
                    <div className={styles.playlists}>
                        <div className={styles.header2}>
                            <h3>My Playlists</h3>
                            <button className={styles.createBtn}>+ Create New</button>
                        </div>
                        <div className={styles.empty}>
                            <p>No playlists yet. Create one to organize your favorite tracks!</p>
                            <button className={styles.primaryBtn}>Create Playlist</button>
                        </div>
                    </div>
                )}

                {tab === "favorites" && (
                    <div className={styles.favorites}>
                        <h3>Favorite Tracks</h3>
                        <div className={styles.empty}>
                            <p>You haven't liked any tracks yet.</p>
                            <Link href="/discover" className={styles.primaryBtn}>
                                Discover Music
                            </Link>
                        </div>
                    </div>
                )}

                {tab === "downloads" && (
                    <div className={styles.downloads}>
                        <h3>Downloaded Tracks</h3>
                        <div className={styles.empty}>
                            <p>Premium subscribers can download tracks for offline listening.</p>
                            <Link href="/subscribe" className={styles.primaryBtn}>
                                Upgrade to Premium
                            </Link>
                        </div>
                    </div>
                )}

                {tab === "subscription" && (
                    <div className={styles.subscription}>
                        <h3>Subscription Status</h3>
                        <div className={styles.subCard}>
                            <div className={styles.subContent}>
                                <p className={styles.tier}>Free Plan</p>
                                <p className={styles.description}>
                                    Enjoy unlimited streaming with ads
                                </p>
                            </div>
                            <Link href="/subscribe" className={styles.upgradeBtn}>
                                Upgrade to Premium
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
