"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTRPC } from "@/trpc/client";

import { generateTenantURL } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCartIcon } from "lucide-react";
//import { CheckoutButton } from "@/modules/checkout/ui/components/checkout-button";

const CheckoutButton = dynamic(
  () => import("@/modules/checkout/ui/components/checkout-button").then(
    (mod) => mod.CheckoutButton,
  ),

  {
    ssr: false,
    loading: () => (
        <Button disabled className="bg-white">
            <ShoppingCartIcon className="text-black"/>
        </Button>
    )
  },
);

interface Props {
    slug: string;
};

export const Navbar = ({ slug }: Props) => {
    const trpc = useTRPC();
    const { data } = useSuspenseQuery(trpc.tenants.getOne.queryOptions({ slug }))

    return (
        <nav className="h-20 border-b font-medium bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
                <Link prefetch href="/" className="flex items-center gap-2">
                     <Button variant="elevated"   className="border-transparent bg-transparent hover:border-black">
                        <ArrowLeft className="size-4"/>
                        <span className="text font-medium">Home</span>
                    </Button>
                 </Link>
                 <Link href={generateTenantURL(slug)} className="flex items-center gap-2">
                    {data.image?.url && (
                        <Image 
                            src= {data.image.url}
                            width={32}
                            height={32}
                            className="rounded-full border shrink-0 size-[32px]"
                            alt={slug}
                        />
                    )}
                    <p className="text-xl underline">{data.name} Store</p>
                 </Link>
                <CheckoutButton tenantSlug={slug} />
            </div>
        </nav>
    );
};

export const NavbarSkeleton = () => {
    return(
        <nav className="h-20 border-b font-medium bg-white">
            <div className="max-w-(--breakpoint-xl) mx-auto flex justify-between items-center h-full px-4 lg:px-12">
                <div />
                <Button disabled className="bg-white">
                    <ShoppingCartIcon className="text-black"/>
                </Button>
            </div>
        </nav>
    );
};