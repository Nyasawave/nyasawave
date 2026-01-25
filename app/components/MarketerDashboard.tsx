import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./MarketerDashboard.module.css";

/**
 * MARKETER DASHBOARD
 * 
 * Views:
 * - Campaign management
 * - Audience analytics
 * - Performance metrics
 * - Budget tracking
 * - ROI analysis
 */

export default function MarketerDashboard() {
    const { data: session } = useSession();
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({
        impressions: 0,
        clicks: 0,
        conversions: 0,
        spend: 0,
        roi: 0,
    });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"campaigns" | "analytics" | "audience" | "budget">(
        "campaigns"
    );

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Marketing Dashboard</h1>
                <p>Track campaigns and audience engagement</p>
            </div>

            {/* Metrics Cards */}
            <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                    <div className={styles.metric}>
                        <p className={styles.label}>Impressions</p>
                        <p className={styles.number}>{metrics.impressions.toLocaleString()}</p>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metric}>
                        <p className={styles.label}>Clicks</p>
                        <p className={styles.number}>{metrics.clicks.toLocaleString()}</p>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metric}>
                        <p className={styles.label}>Conversions</p>
                        <p className={styles.number}>{metrics.conversions}</p>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metric}>
                        <p className={styles.label}>Ad Spend</p>
                        <p className={styles.number}>${metrics.spend.toFixed(2)}</p>
                    </div>
                </div>
                <div className={styles.metricCard}>
                    <div className={styles.metric}>
                        <p className={styles.label}>ROI</p>
                        <p className={styles.number + " " + styles.roi}>
                            {metrics.roi}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === "campaigns" ? styles.active : ""}`}
                    onClick={() => setTab("campaigns")}
                >
                    🎯 Campaigns
                </button>
                <button
                    className={`${styles.tab} ${tab === "analytics" ? styles.active : ""}`}
                    onClick={() => setTab("analytics")}
                >
                    📈 Analytics
                </button>
                <button
                    className={`${styles.tab} ${tab === "audience" ? styles.active : ""}`}
                    onClick={() => setTab("audience")}
                >
                    👥 Audience
                </button>
                <button
                    className={`${styles.tab} ${tab === "budget" ? styles.active : ""}`}
                    onClick={() => setTab("budget")}
                >
                    💰 Budget
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {tab === "campaigns" && (
                    <div className={styles.campaigns}>
                        <div className={styles.header2}>
                            <h3>Active Campaigns</h3>
                            <button className={styles.createBtn}>+ New Campaign</button>
                        </div>
                        <div className={styles.empty}>
                            <p>No campaigns yet. Start your first campaign!</p>
                            <button className={styles.primaryBtn}>Create Campaign</button>
                        </div>
                    </div>
                )}

                {tab === "analytics" && (
                    <div className={styles.analytics}>
                        <h3>Performance Analytics</h3>
                        <div className={styles.analyticsGrid}>
                            <div className={styles.analyticsCard}>
                                <p className={styles.cardTitle}>Click-Through Rate</p>
                                <div className={styles.progressBar}>
                                    <div className={styles.progress} style={{ width: "45%" }} />
                                </div>
                                <p className={styles.cardValue}>4.5%</p>
                            </div>
                            <div className={styles.analyticsCard}>
                                <p className={styles.cardTitle}>Conversion Rate</p>
                                <div className={styles.progressBar}>
                                    <div className={styles.progress} style={{ width: "32%" }} />
                                </div>
                                <p className={styles.cardValue}>3.2%</p>
                            </div>
                            <div className={styles.analyticsCard}>
                                <p className={styles.cardTitle}>Cost Per Click</p>
                                <p className={styles.cardValue}>$0.75</p>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "audience" && (
                    <div className={styles.audience}>
                        <h3>Audience Demographics</h3>
                        <div className={styles.demographicsGrid}>
                            <div className={styles.demographic}>
                                <p className={styles.label}>Age Groups</p>
                                <div className={styles.bars}>
                                    <div className={styles.bar}>18-24</div>
                                    <div className={styles.bar}>25-34</div>
                                    <div className={styles.bar}>35-44</div>
                                    <div className={styles.bar}>45+</div>
                                </div>
                            </div>
                            <div className={styles.demographic}>
                                <p className={styles.label}>Geographic Distribution</p>
                                <div className={styles.bars}>
                                    <div className={styles.bar}>North America</div>
                                    <div className={styles.bar}>Europe</div>
                                    <div className={styles.bar}>Africa</div>
                                    <div className={styles.bar}>Asia</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "budget" && (
                    <div className={styles.budget}>
                        <h3>Budget Allocation</h3>
                        <div className={styles.budgetInfo}>
                            <div className={styles.budgetItem}>
                                <p className={styles.budgetLabel}>Monthly Budget</p>
                                <p className={styles.budgetValue}>$1,000.00</p>
                            </div>
                            <div className={styles.budgetItem}>
                                <p className={styles.budgetLabel}>Spent This Month</p>
                                <p className={styles.budgetValue}>$0.00</p>
                            </div>
                            <div className={styles.budgetItem}>
                                <p className={styles.budgetLabel}>Remaining</p>
                                <p className={styles.budgetValue} style={{ color: "#1db954" }}>
                                    $1,000.00
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
