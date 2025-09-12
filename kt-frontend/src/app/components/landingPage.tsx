"use client"

import axios from "axios"
import React, { useEffect, useState } from "react"
import Cookies from "js-cookie"

interface User {
    name: string
    email: string
    dateTime: string
}

export default function LandingPage() {
    const [users, setUsers] = useState<User[]>([])
    const code = Cookies.get('referralCode')

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!code || code.trim() === '') {
                    console.warn("No userId found in cookies")
                    return
                }
                const response = await axios.get(`http://localhost:8010/user/referralUsage/${code}`,
                    {
                        headers: {
                            Authorization: `Bearer ${Cookies.get('token')}`
                        }
                    }
                )
                if (response.status === 200) {
                    const mappedUsers: User[] = response.data.data.map((item: any) => ({
                        name: `${item.usedBy.firstName} ${item.usedBy.lastName}`,
                        email: item.usedBy.email,
                        dateTime: new Date(item.createdAt).toLocaleString(),
                    }))
                    setUsers(mappedUsers)
                }
            } catch (error) {
                console.error("Error fetching user data:", error)
            }
        }
        fetchData()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* Card Container */}
            <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl p-6">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Referral Usage Overview
                    </h1>
                    <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                        Total Users: {users.length}
                    </span>
                </div>

                {/* Table */}
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
                                        No referral usage found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
