"use client";

import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";

import { ReviewSidebar } from "../components/review-sidebar";
import { ReviewFormSkeleton } from "../components/review-form";

interface Props {
    productId: string
}

export const ProductView = ({ productId }: Props) => {

    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.library.getOne.queryOptions({
        productId
    }));

    return (
    <div className="min-h-screen bg-white">
        <nav className="p-4 bg-[#F2F2F2] w-full border-b">
            <Link prefetch href="/dashboard/purchases" className="flex items-center gap-2">
              <Button variant="elevated" className="border-transparent bg-transparent hover:border-black">
                <ArrowLeft className="size-4"/>
                <span className="text font-medium">Back to Purchases</span>
              </Button>
            </Link>
        </nav> 
        <header className="bg-[#F5F4F0] py-8 border-b">
            <div className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12">
                <h1 className="text-[40px] font-medium">{data.name}</h1>
            </div>
        </header>
        <section className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 lg:gap-16">

                <div className="lg:col-span-2">
                    <div className="p-4 bg-white border rounded-md gap-4">
                       <Suspense fallback={<ReviewFormSkeleton />}>
                            <ReviewSidebar productId={productId}/>
                        </Suspense>
                    </div>
                </div>
                <div className="lg:col-span-5">
                    <div className="space-y-6">
                        <div className="bg-white border rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Your Purchase Content</h2>
                            
                            {/* Text Content (License Keys, Codes, etc.) */}
                            {data.deliveryText && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-medium text-gray-900">License Key / Content</h3>
                                    <div className="bg-gray-50 border rounded-lg p-4">
                                        <pre className="whitespace-pre-wrap text-sm font-mono text-gray-800">
                                            {data.deliveryText}
                                        </pre>
                                    </div>
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => navigator.clipboard.writeText(data.deliveryText || '')}
                                    >
                                        Copy to Clipboard
                                    </Button>
                                </div>
                            )}
                            
                            {/* File Download */}
                            {data.file && typeof data.file === 'object' && data.file.url && (
                                <div className="space-y-3">
                                    <h3 className="text-lg font-medium text-gray-900">Download File</h3>
                                    <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        <div className="flex-shrink-0">
                                            <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                                            </svg>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-blue-900">
                                                {data.file.filename || 'Download File'}
                                            </p>
                                            {data.file.filesize && (
                                                <p className="text-sm text-blue-700">
                                                    Size: {(data.file.filesize / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            )}
                                        </div>
                                        <Button asChild>
                                            <a href={data.file.url} download>
                                                Download
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {/* No Content Message */}
                            {!data.deliveryText && !(data.file && typeof data.file === 'object' && data.file.url) && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 italic">
                                        No content available for this product.
                                    </p>
                                </div>
                            )}
                        </div>
                        
                        {/* Product Info */}
                        <div className="bg-gray-50 border rounded-lg p-6">
                            <h3 className="text-lg font-semibold mb-3">Product Information</h3>
                            {data.description && (
                                <p className="text-gray-600 mb-3">{data.description}</p>
                            )}
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <span>Purchase Date</span>
                                <span>Access: Lifetime</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    </div>
    )
};

export const ProductViewSkeleton = () => {
    return (
        <div className="min-h-screen bg-white">
            <nav className="p-4 bg-[#F2F2F2] w-full border-b">
                <div className="flex items-center gap-2">
                    <ArrowLeft className="size-4"/>
                    <span className="text font-medium">Back to Library</span>
                </div>
            </nav> 
        </div>    
    );
};