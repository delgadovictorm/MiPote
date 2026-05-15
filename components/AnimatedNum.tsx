"use client";

import React, { useEffect, useState } from "react";

interface AnimatedNumProps {
  value: number;
  format?: "usd" | "bs" | "pct";
  precision?: number;
}

export function AnimatedNum({
  value,
  format = "usd",
  precision = 2,
}: AnimatedNumProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    const duration = 800;
    const startTime = Date.now();

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const newValue = start + (end - start) * progress;
      setDisplayValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  if (format === "pct") {
    return <>{displayValue.toFixed(1)}%</>;
  }

  if (format === "bs") {
    return <>
      {displayValue.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}
    </>;
  }

  return <>
    {displayValue.toLocaleString("es-VE", {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    })}
  </>;
}
