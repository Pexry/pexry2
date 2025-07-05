import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
    Store, 
    Zap, 
    Shield, 
    BarChart3, 
    MessageSquare, 
    CreditCard, 
    Globe, 
    Star, 
    Users, 
    Download, 
    Bell, 
    Headphones,
    Lock,
    Smartphone,
    TrendingUp,
    FileText,
    Search,
    Settings
} from "lucide-react";
import Link from "next/link";

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
    category: string;
}

const features: Feature[] = [
    // Selling Features
    {
        icon: <Store className="h-8 w-8 text-blue-600" />,
        title: "Easy Product Listing",
        description: "Upload and list your digital products in minutes with our intuitive interface. Support for all file types and formats.",
        category: "Selling"
    },
    {
        icon: <Zap className="h-8 w-8 text-yellow-600" />,
        title: "Instant Digital Delivery",
        description: "Products are delivered automatically to customers immediately after purchase. No manual intervention required.",
        category: "Selling"
    },
    {
        icon: <BarChart3 className="h-8 w-8 text-green-600" />,
        title: "Advanced Analytics",
        description: "Track sales, revenue, customer behavior, and product performance with comprehensive analytics dashboard.",
        category: "Selling"
    },
    {
        icon: <TrendingUp className="h-8 w-8 text-purple-600" />,
        title: "Marketing Tools",
        description: "Promote your products with built-in marketing features including discounts, promotions, and featured listings.",
        category: "Selling"
    },
    
    // Security & Trust
    {
        icon: <Shield className="h-8 w-8 text-red-600" />,
        title: "Secure Payments",
        description: "Bank-level security with fraud detection. All transactions are encrypted and PCI DSS compliant.",
        category: "Security"
    },
    {
        icon: <Lock className="h-8 w-8 text-gray-600" />,
        title: "Data Protection",
        description: "Your files and customer data are protected with enterprise-grade security and regular backups.",
        category: "Security"
    },
    {
        icon: <CreditCard className="h-8 w-8 text-indigo-600" />,
        title: "Multiple Payment Methods",
        description: "Accept payments via Crypto",
        category: "Security"
    },
    
    // Customer Experience
    {
        icon: <MessageSquare className="h-8 w-8 text-teal-600" />,
        title: "Customer Messaging",
        description: "Built-in messaging system to communicate with customers, provide support, and build relationships.",
        category: "Customer"
    },
    {
        icon: <Star className="h-8 w-8 text-orange-600" />,
        title: "Review System",
        description: "Customer reviews and ratings help build trust and improve your product visibility.",
        category: "Customer"
    },
    {
        icon: <Download className="h-8 w-8 text-cyan-600" />,
        title: "Easy Downloads",
        description: "Customers can easily download their purchases with secure, time-limited download links.",
        category: "Customer"
    },
    
    // Platform Features
    {
        icon: <Globe className="h-8 w-8 text-emerald-600" />,
        title: "Global Marketplace",
        description: "Reach customers worldwide with multi-currency support and international payment processing.",
        category: "Platform"
    },
    {
        icon: <Smartphone className="h-8 w-8 text-pink-600" />,
        title: "Mobile Responsive",
        description: "Fully responsive design works perfectly on desktop, tablet, and mobile devices.",
        category: "Platform"
    },
    {
        icon: <Search className="h-8 w-8 text-violet-600" />,
        title: "SEO Optimized",
        description: "Product pages are optimized for search engines to help customers discover your products.",
        category: "Platform"
    },
    {
        icon: <Bell className="h-8 w-8 text-amber-600" />,
        title: "Real-time Notifications",
        description: "Get instant notifications for new orders, messages, and important account updates.",
        category: "Platform"
    },
    
    // Support
    {
        icon: <Headphones className="h-8 w-8 text-blue-500" />,
        title: "24/7 Support",
        description: "Our dedicated support team is available around the clock to help you succeed.",
        category: "Support"
    },
    {
        icon: <FileText className="h-8 w-8 text-green-500" />,
        title: "Comprehensive Documentation",
        description: "Detailed guides, tutorials, and best practices to help you maximize your success.",
        category: "Support"
    },
    {
        icon: <Users className="h-8 w-8 text-red-500" />,
        title: "Seller Community",
        description: "Connect with other sellers, share tips, and learn from successful creators.",
        category: "Support"
    }
];

const categories = [...new Set(features.map(feature => feature.category))];

const benefits = [
    {
        title: "Start Selling Immediately",
        description: "No waiting periods or approval processes. Upload your products and start selling right away.",
        icon: <Zap className="h-12 w-12 text-yellow-500" />
    },
    {
        title: "Keep More of Your Earnings",
        description: "With only 10% commission and no monthly fees, you keep more of what you earn.",
        icon: <TrendingUp className="h-12 w-12 text-green-500" />
    },
    {
        title: "Reach Global Customers",
        description: "Sell to customers worldwide with our international payment processing and multi-language support.",
        icon: <Globe className="h-12 w-12 text-blue-500" />
    },
    {
        title: "Focus on Creating",
        description: "We handle payments, delivery, and customer support so you can focus on what you do best.",
        icon: <Users className="h-12 w-12 text-purple-500" />
    }
];

const Page = () => {
    return (
        <div className="px-4 lg:px-12 py-8">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">Powerful Features for Digital Creators</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Everything you need to build, market, and grow your digital business on Pexry. 
                        From listing products to analyzing sales, we've got you covered.
                    </p>
                </div>

                <Separator className="mb-12" />

                {/* Key Benefits */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Why Choose Pexry?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {benefits.map((benefit, index) => (
                            <Card key={index} className="rounded-md text-center p-6 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                                <div className="flex justify-center mb-4">
                                    {benefit.icon}
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                                <p className="text-gray-600">{benefit.description}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                <Separator className="mb-12" />

                {/* Features by Category */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-12">Complete Feature Set</h2>
                    
                    {categories.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-12">
                            <h3 className="text-2xl font-bold mb-6 text-center">{category} Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {features
                                    .filter(feature => feature.category === category)
                                    .map((feature, featureIndex) => (
                                        <Card key={featureIndex} className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded-lg">
                                                        {feature.icon}
                                                    </div>
                                                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <p className="text-gray-600">{feature.description}</p>
                                            </CardContent>
                                        </Card>
                                    ))}
                            </div>
                            {categoryIndex < categories.length - 1 && <Separator className="mt-8" />}
                        </div>
                    ))}
                </div>

                {/* Feature Highlights */}
                <div className="mb-16">
                    <h2 className="text-3xl font-bold text-center mb-8">Feature Highlights</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <Card className="p-8 rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <BarChart3 className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-semibold">Advanced Analytics Dashboard</h3>
                            </div>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                    Real-time sales tracking and revenue reports
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                    Customer behavior and demographics analysis
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                    Product performance insights and recommendations
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                    Export data for external analysis
                                </li>
                            </ul>
                        </Card>

                        <Card className="p-8 rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-green-100 rounded-full">
                                    <Shield className="h-8 w-8 text-green-600" />
                                </div>
                                <h3 className="text-2xl font-semibold">Enterprise-Grade Security</h3>
                            </div>
                            <ul className="space-y-3 text-gray-600">
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                    SSL encryption for all data transmission
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                    PCI DSS compliant payment processing
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                    Advanced fraud detection and prevention
                                </li>
                                <li className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                    Regular security audits and updates
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>

                {/* Integration & API */}
                <div className="mb-16">
                    <Card className="p-8 text-center rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-purple-100 rounded-full">
                                <Settings className="h-12 w-12 text-purple-600" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-bold mb-4">Built for Growth</h2>
                        <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
                            Whether you're just starting out or scaling your business, Pexry grows with you. 
                            Our platform is designed to handle everything from your first sale to millions in revenue.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-blue-600 mb-2">99.9%</h3>
                                <p className="text-gray-600">Uptime Guarantee</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-green-600 mb-2">10GB</h3>
                                <p className="text-gray-600">Storage per Product</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-2xl font-bold text-purple-600 mb-2">Unlimited</h3>
                                <p className="text-gray-600">Products & Sales</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-12">
                    <h2 className="text-3xl font-bold mb-4">Ready to Experience These Features?</h2>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join thousands of creators who are already using Pexry's powerful features to build successful digital businesses.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/sign-up">
                            <Button  className="bg-white text-black hover:text-white hover:bg-black cursor-pointer" variant="elevated">
                                Start Selling Today
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button 
                                variant="elevated"
                                className="bg-black text-white hover:text-black hover:bg-white cursor-pointer"
                            >
                                View Pricing
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Page;