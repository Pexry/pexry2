"use client";

import { ListFilterIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { CategoriesGetManyOutput } from "@/modules/categories/types";

import { CategoryDropdown } from "./category-dropdown";
import { CategoriesSidebar } from "./categories-sidebar";




interface Props {
    data: CategoriesGetManyOutput
};
export const Categories = ({ data }: Props) => {
    const params = useParams();

    const containerRef = useRef<HTMLDivElement>(null);
    const measureRef = useRef<HTMLDivElement>(null);
    const viewAllRef = useRef<HTMLDivElement>(null);

    const [visibleCount, setVisibleCount] = useState(data.length);
    const [isAnyHovered, setIsAnyHovered] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);  


    const categoryParam = params.category as string | undefined;
    const activeCategory = categoryParam || "all";
    const activeCategoryIndex = data.findIndex((cat) => cat.slug === activeCategory);
    const isActiveCategoryHidden = activeCategoryIndex >= visibleCount && activeCategoryIndex !== -1;



    useEffect(() => {
        const calculateVisible = () => {
            if(!containerRef.current || !measureRef.current || !viewAllRef.current) return;
            const containerWidth = containerRef.current.offsetWidth;
            const viewAllWidth = viewAllRef.current.offsetWidth;
            const availableWidth = containerWidth - viewAllWidth;

            const items = Array.from(measureRef.current.children);
            let totalWidth = 0;
            let visible = 0;
            for (const item of items){
               const width = item.getBoundingClientRect().width;

                if (totalWidth + width > availableWidth) break;
                totalWidth += width;
                visible++;
            }
            setVisibleCount(visible);
        };
        const resizeObserver = new ResizeObserver(calculateVisible);
        resizeObserver.observe(containerRef.current!);
        return () => resizeObserver.disconnect();
    }, [data.length]);

    return (
        <div className="relative w-full">
            {/* Categories SideBar */}
            <CategoriesSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen}/>
            {/* Hiden div to measure all items */}
            <div 
            ref={measureRef}
            className="absolute opacity-0 pointer-events-non flex"
            style={{ position: "fixed", top: -9999, left: -9999 }}
            >
                {data.map((category) => (
                    <div key={category.id}>
                        <CategoryDropdown
                            category={category}
                            isActive={activeCategory === category.slug}
                            isNavigationHovered={false}
                            />
                    </div>
                ))}
            </div>
            {/* Visible Items */}
            <div
                ref={containerRef}
                className="flex flex-nowrap items-center"
                onMouseEnter={() => setIsAnyHovered(true)}
                onMouseLeave={() => setIsAnyHovered(false)}
            >

                {/* TODO: Hardcode "All" button */}
                {data.slice(0, visibleCount).map((category) => (
                    <div key={category.id}>
                        <CategoryDropdown
                            category={category}
                            isActive={activeCategory === category.slug}
                            isNavigationHovered={isAnyHovered}
                            />
                    </div>
                ))}
                <div ref={viewAllRef} className="shrink-0">
                    <Button
                        variant="elevated"
                        className={cn(
                            "h-11 px-4 bg-transparent border-transparent rounded-full hover:bg-teal-300 hover:border-primary text-black",
                            isActiveCategoryHidden && !isAnyHovered && "bg-teal-300 border-primary"
                        )}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        All Categories
                        <ListFilterIcon className="ml-2"/>
                    </Button>
                </div>    
            </div>
        </div>
    );
};