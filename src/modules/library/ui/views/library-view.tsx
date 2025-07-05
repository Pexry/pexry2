import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { ProductList, ProductListSkeleton } from "../components/product-list";
import { Button } from "@/components/ui/button";

export const LibraryView = () => {
    return (
    <div className="min-h-screen bg-white">
        <nav className="p-4 bg-[#F2F2F2] w-full border-b">
            <Link prefetch href="/" className="flex items-center gap-2">
              <Button variant="elevated" className="border-transparent bg-transparent hover:border-black">
                <ArrowLeft className="size-4"/>
                <span className="text font-medium">Continue Shopping</span>
              </Button>
            </Link>
        </nav> 
        <header className="bg-[#F5F4F0] py-8 border-b">
            <div className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 flex flex-col gap-y-4">
                <h1 className="text-[40px] font-medium">Library</h1>
            </div>
        </header>
        <section className="max-w-(--breakpoint-xl) mx-auto px-4 lg:px-12 py-10">
            <Suspense fallback={<ProductListSkeleton />}>
                <ProductList />
            </Suspense>
        </section>
    </div>
    )
};