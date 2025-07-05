"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: "Getting Started",
        question: "What is Pexry?",
        answer: "Pexry is a digital marketplace where creators can sell their digital products, services, and experiences. Whether you're selling digital art, software, courses, or any other digital content, Pexry provides the platform to reach customers worldwide."
    },
    {
        category: "Getting Started",
        question: "How do I create an account?",
        answer: "Creating an account is simple! Click the 'Start Selling' button in the top navigation, fill in your details, and verify your email address. Once verified, you can start browsing products or set up your seller profile."
    },
    {
        category: "Getting Started",
        question: "Is Pexry free to use?",
        answer: "Yes, creating an account and browsing products on Pexry is completely free. We only charge a small commission on successful sales to cover platform costs and continue improving our services."
    },
    {
        category: "Selling",
        question: "How do I start selling on Pexry?",
        answer: "After creating your account, go to your dashboard and click 'Add Product'. Upload your digital files, add descriptions, set your price, and publish your product. Your items will be available to customers immediately."
    },
    {
        category: "Selling",
        question: "What types of products can I sell?",
        answer: "You can sell any legal digital product including: digital art, graphics, templates, software, mobile apps, courses, ebooks, music, videos, photography, and more. Physical products are not supported at this time."
    },
    {
        category: "Selling",
        question: "How much commission does Pexry charge?",
        answer: "Pexry charges a competitive commission rate of 10% on each sale."
    },
    {
        category: "Selling",
        question: "When do I get paid?",
        answer: "Payments are processed automatically after the buyer's refund period expires (typically 1-14 days). You can track your earnings and request withdrawals from your dashboard."
    },
    {
        category: "Buying",
        question: "How do I purchase products?",
        answer: "Browse our marketplace, click on any product you're interested in, and click 'Add to Cart'. Complete the checkout process , and you'll receive instant access to your digital purchase."
    },
    {
        category: "Buying",
        question: "What payment methods do you accept?",
        answer: "We accept Crypto payments. All transactions are secured with industry-standard encryption to protect your financial information."
    },
    {
        category: "Buying",
        question: "Can I get a refund?",
        answer: "Yes, we offer a refund policy for digital products. If you're not satisfied with your purchase, you can open a dispute within the specified timeframe (usually 7-14 days). Each seller may have their own refund policy."
    },
    {
        category: "Buying",
        question: "How do I download my purchases?",
        answer: "After completing your purchase,  You can access all your purchases from your account dashboard under 'Purchases'."
    },
    {
        category: "Support",
        question: "How can I contact customer support?",
        answer: "You can reach our support team through the 'Contact Support' section in your dashboard. We typically respond imediatly."
    },
    {
        category: "Support",
        question: "What if I have a dispute with a seller/buyer?",
        answer: "Pexry provides a dispute resolution system. You can open a dispute case from your dashboard, and our team will mediate to find a fair solution for both parties."
    },
];

const categories = [...new Set(faqs.map(faq => faq.category))];

const Page = () => {
    const [openItems, setOpenItems] = useState<number[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("All");

    const toggleItem = (index: number) => {
        setOpenItems(prev => 
            prev.includes(index) 
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const filteredFaqs = selectedCategory === "All" 
        ? faqs 
        : faqs.filter(faq => faq.category === selectedCategory);

    return (
        <div className="px-4 lg:px-12 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <HelpCircle className="h-8 w-8 text-blue-600" />
                        <h1 className="text-4xl lg:text-5xl font-bold">Frequently Asked Questions</h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Find answers to common questions about using Pexry. Can't find what you're looking for? Contact our support team.
                    </p>
                </div>

                <Separator className="mb-8" />

                {/* Category Filter */}
                <div className="mb-8">
                    <h2 className="text-lg font-semibold mb-4">Filter by Category:</h2>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setSelectedCategory("All")}
                            className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                selectedCategory === "All"
                                    ? "bg-black text-white rounded-full"
                                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 cursor-pointer"
                            }`}
                        >
                            All ({faqs.length})
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                                    selectedCategory === category
                                        ? "bg-black text-white cursor-pointer"
                                        : "bg-gray-100 hover:bg-gray-200 cursor-pointer text-gray-700"
                                }`}
                            >
                                {category} ({faqs.filter(faq => faq.category === category).length})
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {filteredFaqs.map((faq, index) => {
                        const isOpen = openItems.includes(index);
                        return (
                            <Card key={index} className="overflow-hidden rounded-md">
                                <button
                                    onClick={() => toggleItem(index)}
                                    className="w-full cursor-pointer text-left p-6 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm font-medium text-blue-600 mb-1 block">
                                                {faq.category}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {faq.question}
                                            </h3>
                                        </div>
                                        <div className="flex-shrink-0 ml-4">
                                            {isOpen ? (
                                                <ChevronUp className="h-5 w-5 text-gray-500" />
                                            ) : (
                                                <ChevronDown className="h-5 w-5 text-gray-500" />
                                            )}
                                        </div>
                                    </div>
                                </button>
                                {isOpen && (
                                    <CardContent className="px-6 pb-6 pt-0">
                                        <Separator className="mb-4" />
                                        <p className="text-gray-700 leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </CardContent>
                                )}
                            </Card>
                        );
                    })}
                </div>

                {/* Contact Support Section */}
                <div className="mt-12 text-center bg-gray-50 rounded-lg p-8">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/about">
                            <Button variant="elevated">
                                Learn More About Pexry
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;