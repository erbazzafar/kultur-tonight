"use client"

import { useParams } from "next/navigation"
import axios from "axios"
import React, { useEffect, useState } from "react"
import Cookies from "js-cookie"
import { Copy } from "lucide-react"
import { ReferralProgress } from "../components/progressBar"

interface User {
    name: string
    email: string
    dateTime: string
}

export default function ReferralUsagePage() {
    const params = useParams()
    const referralCode = params.referralCode as string
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!referralCode) return

                const response = await axios.get(
                    `http://localhost:8010/user/referalUsage/${referralCode}`,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get("token")}`,
                        },
                    }
                )

                if (response.status === 200) {
                    const mappedUsers: User[] = response.data.data.map((item: any) => ({
                        name: `${item.usedBy.firstName} ${item.usedBy.lastName}`,
                        email: item.usedBy.email,
                        dateTime: new Date(item.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        }),
                    }))
                    setUsers(mappedUsers)
                }
            } catch (error) {
                console.error("Error fetching user data:", error)
            }
        }

        fetchData()
    }, [referralCode])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-indigo-400 to-blue-500 text-white px-8 py-10">
                    <h1 className="text-3xl font-extrabold mb-4">Welcome to Your Referral Dashboard 🎉</h1>
                    <p className="text-lg text-indigo-100 max-w-2xl">
                        Thank you for being part of our referral program. Here, you can track the progress
                        of everyone who has joined using <span className="font-semibold">your referral code</span>.
                        Share your link, grow your network, and unlock rewards as more people sign up!
                    </p>
                </div>

                {/* Stats + Table */}
                <div className="p-8">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b pb-4 mb-6 space-y-4 md:space-y-0">
                        {/* Left side: Title + Code */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">
                                Referral Usage Overview
                            </h2>
                            <div className="mt-2 flex items-center space-x-2">
                                <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                                    Code: {referralCode}
                                </span>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(referralCode)
                                        alert("Referral code copied to clipboard!")
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-200 transition"
                                    title="Copy referral code"
                                >
                                    <Copy className="w-4 h-4 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        {/* Right side: Progress + Users */}
                        <div className="flex items-center space-x-6">
                            <ReferralProgress value={users.length} />
                            {users && (
                                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                                    Total Users: {users.length}
                                </span>
                            )}
                        </div>
                    </div>


                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-900 uppercase text-xs tracking-wider">
                                <tr>
                                    <th className="px-6 py-3">#</th>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map((user, index) => (
                                        <tr
                                            key={index}
                                            className="hover:bg-blue-50 transition border-b last:border-none"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-700">
                                                {index + 1}
                                            </td>
                                            <td className="px-6 py-4 text-gray-800">{user.name}</td>
                                            <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                            <td className="px-6 py-4 text-gray-500">{user.dateTime}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={4}
                                            className="px-6 py-6 text-center text-gray-400 italic"
                                        >
                                            No referral usage found yet. Share your link and start inviting
                                            people today!
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
