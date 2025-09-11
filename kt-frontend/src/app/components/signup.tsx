"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Fira_Code } from "next/font/google";
import axios from "axios";
import OtpModal from "./muiModel";

interface User {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    postCode: string,
    referalCode: string
}

export default function SignupFormDemo() {
    const [formData, setFormData] = useState<User>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        postCode: '',
        referalCode: ''
    })

    const [otp, setOtp] = useState<string>("")
    const [isOtpModelOpen, setIsOtpModelOpen] = useState <boolean> (false)


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!formData.firstName || formData.firstName.trim() === '') {
            alert("first name cannot be empty")
            return
        }

        if (!formData.lastName || formData.lastName.trim() === '') {
            alert("last name cannot be empty")
            return
        }
        
        if (!formData.password) {
            alert("password can not be empty")
            return
        } 
        
        if (!formData.postCode || formData.postCode.trim() === '') {
            alert("post code cannot be empty")
            return
        }
        
        try {
            const sentForm = await axios.post(
                `${process.env.URL}/user/sign-up`,
                formData,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )
            
            if (sentForm.status !== 200) {
                alert("Error sbumitting the form API")
                return
            }
            
            setIsOtpModelOpen(true)
            console.log("Response from send form: ",sentForm.data)

        } catch (error) {
            throw new Error
        }
    };

    const verifyOtp = async () => {
        try {
            if (otp.length < 6) {
                alert("Enter the complete OTP")
                return
            }

            const sendOtp = await axios.post(
                `${process.env.URL}/user/verify-otp`,
                {
                    email: formData.email,
                    otp
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (sendOtp.status !== 200) {
                alert('Error in sending the OTP API')
                return
            }

            setOtp('')
            setIsOtpModelOpen(false)
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                postCode: '',
                referalCode: ''
            })

            console.log('User signed up successfully !!')
            const data = sendOtp.data
            console.log("Response from verify otp: ",data)

        } catch (error) {
            throw new Error
        }
    }
    return (
        <div className="shadow-input mx-auto w-full max-w-md border border-gray-300 rounded-none bg-white p-3 md:rounded-2xl md:p-8 dark:bg-black">
            <h2 className="text-center text-xl font-bold text-neutral-800 dark:text-neutral-200">
                Welcome to Kultur Tonight
            </h2>
            <form className="my-8" onSubmit={handleSubmit}>
                <div className="mb-4 flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
                    <LabelInputContainer>
                        <Label htmlFor="firstname">First name</Label>
                        <Input
                            id="firstname"
                            placeholder="Tyler"
                            type="text"
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            value={formData.firstName} />
                    </LabelInputContainer>

                    <LabelInputContainer>
                        <Label htmlFor="lastname">Last name</Label>
                        <Input
                            id="lastname"
                            placeholder="Durden"
                            type="text"
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            value={formData.lastName} />
                    </LabelInputContainer>
                </div>

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                        id="email"
                        placeholder="projectmayhem@fc.com"
                        type="email"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        value={formData.email} />
                </LabelInputContainer>

                <LabelInputContainer className="mb-4">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        value={formData.password} />
                </LabelInputContainer>

                <LabelInputContainer className="mb-6">
                    <Label htmlFor="postCode">Post Code</Label>
                    <Input
                        id="postCode"
                        placeholder="12345"
                        type="text"
                        onChange={(e) => setFormData({ ...formData, postCode: e.target.value })}
                        value={formData.postCode} />
                </LabelInputContainer>

                <LabelInputContainer className="mb-8">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="referalCode">Referral Code</Label>
                        <span className="text-sm text-gray-500 italic">Optional</span>
                    </div>
                    <Input
                        id="referalCode"
                        placeholder="REF344GJY45I"
                        type="text"
                        onChange={(e) => setFormData({ ...formData, referalCode: e.target.value })}
                        value={formData.referalCode} />
                </LabelInputContainer>

                <button
                    className="cursor-pointer group/btn relative block h-10 w-full rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:bg-zinc-800 dark:from-zinc-900 dark:to-zinc-900 dark:shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset]"
                    type="submit"
                >
                    Sign up &rarr;
                    <BottomGradient />
                </button>
            </form>

            <OtpModal open={isOtpModelOpen} handleClose={()=>setIsOtpModelOpen(false)}
                otp={otp}
                setOtp={setOtp}
                verifyOtp={verifyOtp}/>
        </div>
    );
}

const BottomGradient = () => {
    return (
        <>
            <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
            <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
        </>
    );
};

const LabelInputContainer = ({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) => {
    return (
        <div className={cn("flex w-full flex-col space-y-2", className)}>
            {children}
        </div>
    );
};
