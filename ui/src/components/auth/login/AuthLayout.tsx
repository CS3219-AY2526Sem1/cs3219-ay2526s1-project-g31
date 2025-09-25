'use client'

import { ReactNode } from "react";

interface AuthLayoutProps {
    children: ReactNode;
    additionalInfo?: ReactNode;
}

export default function AuthLayout({ children, additionalInfo }: AuthLayoutProps) {
    return (
        <div className="auth-background flex flex-col items-center justify-center min-h-screen">
            <div className="w-full max-w-md">
                <div className="bg-gray-800 shadow-2xl rounded-2xl p-8 border border-gray-700">
                    {children}
                </div>

                {additionalInfo && (
                    <div className="mt-6 text-center w-full">
                        {additionalInfo}
                    </div>
                )}
            </div>
        </div>
    );
}
