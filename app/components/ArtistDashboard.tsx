import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import styles from "./ArtistDashboard.module.css";

/**
 * ARTIST DASHBOARD
 * 
 * Views:
 * - My tracks (list, upload new, edit, delete)
 * - Earnings (revenue from plays, likes, downloads, sales)
 * - Tournament participation
 * - Marketplace sales
 * - Analytics (daily plays, top tracks)
 */

interface Track {
    id: string;
    title: string;
    plays: number;
    likes: number;
    downloads: number;
    uploadedAt: string;
}

interface EarningsData {
    totalEarnings: number;
    monthlyEarnings: number;
    topTrack?: Track;
}

export default function ArtistDashboard() {
    const { data: session } = useSession();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [earnings, setEarnings] = useState<EarningsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"tracks" | "earnings" | "tournaments" | "sales">(
        "tracks"
    );

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load tracks
                const tracksRes = await fetch("/api/tracks/upload");
                const tracksData = await tracksRes.json();
                setTracks(tracksData.tracks || []);

                // Load earnings
                const earningsRes = await fetch("/api/payments/payouts/balance");
                const earningsData = await earningsRes.json();
                setEarnings(earningsData.balance);
            } catch (error) {
                console.error("[ARTIST] Load error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return <div className={styles.loading}>Loading...</div>;
    }

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Artist Dashboard</h1>
                <p>Manage your music and earnings</p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === "tracks" ? styles.active : ""}`}
                    onClick={() => setTab("tracks")}
                >
                    🎵 My Tracks
                </button>
                <button
                    className={`${styles.tab} ${tab === "earnings" ? styles.active : ""}`}
                    onClick={() => setTab("earnings")}
                >
                    💰 Earnings
                </button>
                <button
                    className={`${styles.tab} ${tab === "tournaments" ? styles.active : ""}`}
                    onClick={() => setTab("tournaments")}
                >
                    🏆 Tournaments
                </button>
                <button
                    className={`${styles.tab} ${tab === "sales" ? styles.active : ""}`}
                    onClick={() => setTab("sales")}
                >
                    📊 Sales
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {tab === "tracks" && (
                    <div className={styles.tracks}>
                        <div className={styles.header2}>
                            <h3>My Tracks ({tracks.length})</h3>
                            <Link href="/upload" className={styles.uploadBtn}>
                                ⬆️ Upload New
                            </Link>
                        </div>
                        <div className={styles.tracksList}>
                            {tracks.length === 0 ? (
                                <p className={styles.empty}>
                                    No tracks uploaded yet.{" "}
                                    <Link href="/upload">Upload your first track</Link>
                                </p>
                            ) : (
                                tracks.map(track => (
                                    <div key={track.id} className={styles.trackItem}>
                                        <div>
                                            <p className={styles.trackTitle}>{track.title}</p>
                                            <div className={styles.stats}>
                                                <span>🎧 {track.plays} plays</span>
                                                <span>❤️ {track.likes} likes</span>
                                                <span>📥 {track.downloads} downloads</span>
                                            </div>
                                        </div>
                                        <div className={styles.actions}>
                                            <button className={styles.editBtn}>Edit</button>
                                            <button className={styles.deleteBtn}>Delete</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}

                {tab === "earnings" && earnings && (
                    <div className={styles.earnings}>
                        <h3>Earnings Overview</h3>
                        <div className={styles.earningsGrid}>
                            <div className={styles.earningCard}>
                                <p className={styles.label}>Total Earnings</p>
                                <h2>${earnings.released?.toFixed(2) || "0.00"}</h2>
                            </div>
                            <div className={styles.earningCard}>
                                <p className={styles.label}>Available to Withdraw</p>
                                <h2>${(earnings.availableForPayout || 0).toFixed(2)}</h2>
                            </div>
                            <div className={styles.earningCard}>
                                <p className={styles.label}>Pending</p>
                                <h2>${(earnings.pending || 0).toFixed(2)}</h2>
                            </div>
                        </div>
                        <Link href="/artist/earnings" className={styles.viewBtn}>
                            View Detailed Earnings →
                        </Link>
                    </div>
                )}

                {tab === "tournaments" && (
                    <div className={styles.tournaments}>
                        <h3>Tournament Participation</h3>
                        <p className={styles.comingSoon}>
                            View your tournament submissions and rankings here.
                        </p>
                        <Link href="/discover/tournaments" className={styles.viewBtn}>
                            Browse Tournaments →
                        </Link>
                    </div>
                )}

                {tab === "sales" && (
                    <div className={styles.sales}>
                        <h3>Marketplace Sales</h3>
                        <p className={styles.comingSoon}>
                            Track your marketplace product sales and analytics.
                        </p>
                        <Link href="/marketplace" className={styles.viewBtn}>
                            Go to Marketplace →
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
