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
                "bg-white rounded-xl border border-slate-200 transition-[box-shadow,border-color] duration-150 ease-out",
                hover && "hover:shadow-md hover:border-indigo-200",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

