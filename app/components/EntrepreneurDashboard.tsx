import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import styles from "./EntrepreneurDashboard.module.css";

/**
 * ENTREPRENEUR DASHBOARD
 * 
 * Views:
 * - Products (beats, samples, courses, services)
 * - Sales analytics
 * - Revenue tracking
 * - Customer management
 * - Product performance
 */

export default function EntrepreneurDashboard() {
    const { data: session } = useSession();
    const [products, setProducts] = useState<any[]>([]);
    const [revenue, setRevenue] = useState({
        total: 0,
        thisMonth: 0,
        pending: 0,
    });
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<"products" | "analytics" | "customers" | "performance">(
        "products"
    );

    useEffect(() => {
        setLoading(false);
    }, []);

    return (
        <div className={styles.dashboard}>
            {/* Header */}
            <div className={styles.header}>
                <h1>Business Dashboard</h1>
                <p>Manage your products and track sales</p>
            </div>

            {/* Revenue Cards */}
            <div className={styles.cardGrid}>
                <div className={styles.card}>
                    <div className={styles.cardContent}>
                        <p className={styles.label}>Total Revenue</p>
                        <p className={styles.value}>${revenue.total.toFixed(2)}</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardContent}>
                        <p className={styles.label}>This Month</p>
                        <p className={styles.value}>${revenue.thisMonth.toFixed(2)}</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardContent}>
                        <p className={styles.label}>Pending</p>
                        <p className={styles.value}>${revenue.pending.toFixed(2)}</p>
                    </div>
                </div>
                <div className={styles.card}>
                    <div className={styles.cardContent}>
                        <p className={styles.label}>Products</p>
                        <p className={styles.value}>{products.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${tab === "products" ? styles.active : ""}`}
                    onClick={() => setTab("products")}
                >
                    📦 Products
                </button>
                <button
                    className={`${styles.tab} ${tab === "analytics" ? styles.active : ""}`}
                    onClick={() => setTab("analytics")}
                >
                    📊 Analytics
                </button>
                <button
                    className={`${styles.tab} ${tab === "customers" ? styles.active : ""}`}
                    onClick={() => setTab("customers")}
                >
                    👥 Customers
                </button>
                <button
                    className={`${styles.tab} ${tab === "performance" ? styles.active : ""}`}
                    onClick={() => setTab("performance")}
                >
                    ⭐ Performance
                </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {tab === "products" && (
                    <div className={styles.products}>
                        <div className={styles.header2}>
                            <h3>My Products</h3>
                            <button className={styles.createBtn}>+ Add Product</button>
                        </div>
                        <div className={styles.empty}>
                            <p>No products yet. Start selling today!</p>
                            <button className={styles.primaryBtn}>Create First Product</button>
                        </div>
                    </div>
                )}

                {tab === "analytics" && (
                    <div className={styles.analytics}>
                        <h3>Sales Analytics</h3>
                        <div className={styles.chartContainer}>
                            <div className={styles.chart}>
                                <div className={styles.barChart}>
                                    <div className={styles.bar} style={{ height: "60%" }} />
                                    <div className={styles.bar} style={{ height: "45%" }} />
                                    <div className={styles.bar} style={{ height: "75%" }} />
                                    <div className={styles.bar} style={{ height: "50%" }} />
                                    <div className={styles.bar} style={{ height: "80%" }} />
                                    <div className={styles.bar} style={{ height: "40%" }} />
                                </div>
                                <p className={styles.chartLabel}>Last 6 Days Sales</p>
                            </div>
                        </div>
                    </div>
                )}

                {tab === "customers" && (
                    <div className={styles.customers}>
                        <h3>Customers</h3>
                        <div className={styles.empty}>
                            <p>No customer transactions yet.</p>
                        </div>
                    </div>
                )}

                {tab === "performance" && (
                    <div className={styles.performance}>
                        <h3>Product Performance</h3>
                        <div className={styles.empty}>
                            <p>Top performing products will appear here.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
