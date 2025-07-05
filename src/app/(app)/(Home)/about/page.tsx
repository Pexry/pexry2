import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Store, Users, Shield, Zap } from "lucide-react";
import Link from "next/link";

const Page = () => {
    return (
        <div className="px-4 lg:px-12 py-8">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-4">About Pexry</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Your trusted digital marketplace for buying and selling digital products, services, and experiences.
                    </p>
                </div>

                <Separator className="mb-12" />

                {/* Mission Section */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                    <p className="text-lg text-gray-700 leading-relaxed">
                        At Pexry, we believe in empowering creators and entrepreneurs by providing a seamless platform 
                        to showcase and sell their digital products. Whether you're a designer, developer, artist, or 
                        digital creator, Pexry is your gateway to reaching customers worldwide.
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Store className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>Easy Selling</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Set up your digital storefront in minutes. Upload your products, set your prices, 
                                and start selling to customers around the world.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <Users className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>Global Reach</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Connect with customers from all corners of the globe. Our platform breaks down 
                                geographical barriers for digital commerce.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Shield className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>Secure Transactions</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Your transactions are protected with industry-leading security measures. 
                                Buy and sell with confidence on our secure platform.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="rounded-md hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <Zap className="h-6 w-6 text-orange-600" />
                                </div>
                                <CardTitle>Instant Delivery</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600">
                                Digital products are delivered instantly upon purchase. No shipping delays, 
                                no waiting - just immediate access to your purchases.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Separator className="mb-12" />

                {/* Why Choose Pexry */}
                <div className="mb-12">
                    <h2 className="text-3xl font-bold mb-6">Why Choose Pexry?</h2>
                    <div className="space-y-4">
                        <div className="flex items-start gap-4">
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Creator-Focused</h3>
                                <p className="text-gray-600">
                                    Built by creators, for creators. We understand the unique needs of digital entrepreneurs 
                                    and have designed our platform accordingly.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="w-2 h-2 bg-green-600 rounded-full mt-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Fair Pricing</h3>
                                <p className="text-gray-600">
                                    Competitive fees that don't eat into your profits. We believe in fair pricing 
                                    that helps creators thrive.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-start gap-4">
                            <div className="w-2 h-2 bg-purple-600 rounded-full mt-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                                <p className="text-gray-600">
                                    Our dedicated support team is always here to help you succeed. Get assistance 
                                    whenever you need it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div className="text-center bg-gray-50 rounded-lg p-8">
                    <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
                    <p className="text-gray-600 mb-6">
                        Join thousands of creators who have already made Pexry their digital marketplace of choice.
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