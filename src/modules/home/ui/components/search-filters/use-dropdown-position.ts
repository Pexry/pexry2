import { RefObject } from "react";

export const useDropdownPosition = (
    ref: RefObject<HTMLDivElement | null> | RefObject<HTMLDivElement>
) => {
    const getDropdownPosition = () => {
        if (!ref.current) return { top: 0, left: 0};
        
        const rect = ref.current.getBoundingClientRect();
        const dropdownWidh = 240; 
        
        // calculate the initial position

        let left = rect.left + window.scrollX;
        const top = rect.bottom + window.scrollY;

        // check if dropdown would go off the right edge of the viewport

        if ( left - dropdownWidh > window.innerWidth) {
            // Align to right edge of button instead
            left = rect.right + window.scrollX - dropdownWidh;
            // if still off-screen, align to the right edge of viewport with some padding
            if (left < 0){
                left = window.innerWidth - dropdownWidh - 16;
            }
        }
        // Ensure dropdown doesn't go off left edge 
        if (left < 0){
            left = 16;
        }
        return { top, left };
    };

    return { getDropdownPosition };
};