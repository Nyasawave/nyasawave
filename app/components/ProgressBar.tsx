"use client";

import styles from "./ProgressBar.module.css";

export default function ProgressBar({
  current,
  total,
  className = "",
}: {
  current: number;
  total: number;
  className?: string;
}) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  // Round percentage to nearest 5 to match available CSS classes (0,1,5,10,..100)
  let step = Math.round(percentage / 5) * 5;
  if (percentage > 0 && step === 0) step = 1; // handle tiny non-zero values (fill1 exists)
  step = Math.min(100, Math.max(0, step));
  const fillClassName = `${styles.fill} ${styles[`fill${step}`]}`;

  return (
    <div className={`${styles.bar} ${className}`}>
      <div className={fillClassName} />
    </div>
  );
}
