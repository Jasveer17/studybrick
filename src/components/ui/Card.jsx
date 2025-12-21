import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Card = ({ children, className, hover = true, ...props }) => {
    return (
        <div
            className={cn(
                "bg-white rounded-xl border border-slate-200 transition-all duration-200",
                hover && "hover:shadow-md hover:-translate-y-0.5",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
