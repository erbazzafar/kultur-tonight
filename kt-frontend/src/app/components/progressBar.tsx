"use client"

import * as React from "react"
import { motion, useAnimation } from "framer-motion"
import { cn } from "@/lib/utils"

interface ReferralProgressProps {
    value: number // number of successful referrals
    size?: number
    strokeWidth?: number
    className?: string
}

export function ReferralProgress({
    value,
    size = 110, // smaller than 120
    strokeWidth = 8,
    className,
}: ReferralProgressProps) {
    const maxReferrals = 18
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const progress = Math.min(value / maxReferrals, 1) * circumference

    // reward logic: 1 month per 3 referrals, max 6 months
    const months = Math.min(Math.floor(value / 3), 6)

    const controls = useAnimation()

    React.useEffect(() => {
        controls.start({
            strokeDashoffset: circumference - progress,
            transition: { duration: 1, ease: "easeInOut" },
        })
    }, [progress, circumference, controls])

    return (
        <div className={cn("relative inline-flex items-center justify-center", className)}>
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    className="text-gray-200"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Animated progress */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={controls}
                />
                {/* gradient */}
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366F1" /> {/* indigo-500 */}
                        <stop offset="100%" stopColor="#3B82F6" /> {/* blue-500 */}
                    </linearGradient>
                </defs>
            </svg>

            {/* Center Content */}
            <div className="absolute flex flex-col items-center justify-center text-center">
                {months > 0 && (
                    <>
                        <span className="text-xs font-semibold text-green-600">
                            🎉 {months} month{months > 1 ? "s" : ""}
                        </span>
                        <span className="text-xs font-semibold text-green-600">free</span>
                    </>
                )}
            </div>
        </div>
    )
}
