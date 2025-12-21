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
                "bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300",
                hover && "hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
