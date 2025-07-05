import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, DollarSign, Zap, Shield, Users, TrendingUp, HeadphonesIcon, Globe } from "lucide-react";
import Link from "next/link";

const features = [
    {
        icon: <DollarSign className="h-8 w-8 text-green-600" />,
        title: "Simple Pricing",
        description: "Only 10% commission on each sale. No hidden fees, no monthly subscriptions, no setup costs."
    },
    {
        icon: <Zap className="h-8 w-8 text-blue-600" />,
        title: "Instant Delivery",
        description: "Digital products are delivered immediately after purchase completion."
    },
    {
        icon: <Shield className="h-8 w-8 text-purple-600" />,
        title: "Secure Payments",
        description: "All transactions are protected with bank-level security and fraud detection."
    },
    {
        icon: <Users className="h-8 w-8 text-orange-600" />,
        title: "Global Reach",
        description: "Sell to customers worldwide with our international payment processing."
    },
    {
        icon: <TrendingUp className="h-8 w-8 text-red-600" />,
        title: "Analytics & Insights",
        description: "Track your sales, revenue, and customer behavior with detailed analytics."
    },
    {
        icon: <HeadphonesIcon className="h-8 w-8 text-teal-600" />,
        title: "24/7 Support",
        description: "Get help whenever you need it with our dedicated support team."
    }
];

const includedFeatures = [
    "Unlimited product listings",
    "Professional seller dashboard",
    "Customer messaging system",
    "Order management tools",
    "Sales analytics and reporting",
    "Multiple payment methods",
    "Digital file delivery system",
    "Customer review system",
    "Mobile-responsive storefront",
    "SEO-optimized product pages",
    "Dispute resolution support"
];

const Page = () => {
    return (
        <div className="px-4 lg:px-12 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        No monthly fees, no setup costs, no hidden charges. Just a simple 10% commission on each sale.
                    </p>
                </div>

                <Separator className="mb-12" />

                {/* Main Pricing Card */}
                <div className="max-w-4xl mx-auto mb-16">
                    <Card className="relative overflow-hidden rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow border-2 border-black">
                        <div className="absolute top-0 left-0 right-0 bg-black text-white text-center py-3 text-lg font-medium">
                            One Simple Plan for Everyone
                        </div>
                        
                        <CardHeader className="pt-16 pb-8 text-center">
                            <div className="flex justify-center mb-6">
                                <div className="p-4 bg-green-100 rounded-full">
                                    <DollarSign className="h-12 w-12 text-green-600" />
                                </div>
                            </div>
                            
                            <CardTitle className="text-4xl mb-4">Free to Start</CardTitle>
                            
                            <div className="mb-6">
                                <div className="text-6xl font-bold text-green-600 mb-2">10%</div>
                                <p className="text-xl text-gray-600">Commission per sale</p>
                                <p className="text-lg text-gray-500 mt-2">You keep 90% of every sale</p>
                            </div>
                            
                            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                                Start selling immediately with no upfront costs. We only succeed when you succeed.
                            </p>
                            
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/sign-up">
                                    <Button  className="bg-white text-black hover:text-white hover:bg-black cursor-pointer" variant="elevated">
                                        Start Selling
                                    </Button>
                                </Link>
                                <Link href="/">
                                    <Button 
                                        variant="elevated"
                                        className="bg-black text-white hover:text-black hover:bg-white cursor-pointer"
                                    >
                                        Browse Products
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                    </Card>
                </div>

                {/* How It Works */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">How Our Pricing Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center p-6 rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-blue-600">1</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">List Your Products</h3>
                            <p className="text-gray-600">Upload your digital products completely free. No listing fees, no monthly charges.</p>
                        </Card>
                        
                        <Card className="text-center p-6 rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-green-600">2</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Make Sales</h3>
                            <p className="text-gray-600">When customers buy your products, we process payments securely and deliver instantly.</p>
                        </Card>
                        
                        <Card className="text-center p-6 rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                    <span className="text-2xl font-bold text-purple-600">3</span>
                                </div>
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Get Paid</h3>
                            <p className="text-gray-600">Keep 90% of every sale. We take just 10% to cover platform costs and payment processing.</p>
                        </Card>
                    </div>
                </div>

                {/* Features Included */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Everything Included at No Extra Cost</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <Card key={index} className="p-6 rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                                <div className="flex items-start gap-4">
                                    <div className="flex-shrink-0">
                                        {feature.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                                        <p className="text-gray-600">{feature.description}</p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Full Feature List */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Complete Feature List</h2>
                    <Card className="max-w-4xl mx-auto p-8 rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {includedFeatures.map((feature, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                                    <span className="text-gray-700">{feature}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Pricing Example */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Pricing Examples</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <Card className="p-6 text-center rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">$10 Sale</h3>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Sale Price:</span>
                                    <span>$10.00</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Pexry Fee (10%):</span>
                                    <span>-$1.00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-green-600 text-lg">
                                    <span>You Earn:</span>
                                    <span>$9.00</span>
                                </div>
                            </div>
                        </Card>
                        
                        <Card className="p-6 text-center rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">$50 Sale</h3>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Sale Price:</span>
                                    <span>$50.00</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Pexry Fee (10%):</span>
                                    <span>-$5.00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-green-600 text-lg">
                                    <span>You Earn:</span>
                                    <span>$45.00</span>
                                </div>
                            </div>
                        </Card>
                        
                        <Card className="p-6 text-center rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <h3 className="text-xl font-semibold mb-4">$100 Sale</h3>
                            <div className="space-y-2 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Sale Price:</span>
                                    <span>$100.00</span>
                                </div>
                                <div className="flex justify-between text-red-600">
                                    <span>Pexry Fee (10%):</span>
                                    <span>-$10.00</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-green-600 text-lg">
                                    <span>You Earn:</span>
                                    <span>$90.00</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Pricing FAQs</h2>
                    <div className="max-w-3xl mx-auto space-y-6">
                        <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-2">Are there any hidden fees?</h3>
                                <p className="text-gray-600">No, absolutely not. We only charge 10% commission on successful sales. There are no listing fees, monthly subscriptions, or setup costs.</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-2">When do you take the commission?</h3>
                                <p className="text-gray-600">The 10% commission is automatically deducted from each sale before funds are transferred to your account. You'll see the net amount (90%) in your dashboard.</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-2">What does the 10% cover?</h3>
                                <p className="text-gray-600">The commission covers payment processing, platform hosting, customer support, fraud protection, and all the features you need to run your digital business.</p>
                            </CardContent>
                        </Card>
                        
                        <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-2">How do I get paid?</h3>
                                <p className="text-gray-600">Payments are processed automatically and transferred to your account after the buyer's refund period expires (typically 1-14 days).</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-12">
                    <h2 className="text-3xl font-bold mb-4">Ready to Start Earning on Pexry?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of creators who are making money with our simple, fair pricing model.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up">
                            <Button  className="bg-white text-black hover:text-white hover:bg-black cursor-pointer" variant="elevated">
                                Start Selling
                            </Button>
                        </Link>
                        <Link href="/">
                            <Button 
                                variant="elevated"
                                className="bg-black text-white hover:text-black hover:bg-white cursor-pointer"
                            >
                                Browse Products
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;