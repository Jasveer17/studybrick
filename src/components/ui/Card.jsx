import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../../context/ThemeContext';

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const Card = ({ children, className, hover = true, ...props }) => {
    const { isDark } = useTheme();

    return (
        <div
            className={cn(
                isDark
                    ? "bg-slate-800 rounded-xl border border-slate-700 transition-[box-shadow,border-color] duration-150 ease-out"
                    : "bg-white rounded-xl border border-slate-200 transition-[box-shadow,border-color] duration-150 ease-out",
                hover && (isDark ? "hover:shadow-md hover:border-indigo-500" : "hover:shadow-md hover:border-indigo-200"),
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;

