import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Premium Card Component
 * A sophisticated card with layered shadows and hover effects
 */
export const PremiumCard = ({
    children,
    className = '',
    hover = true,
    padding = 'p-6',
    onClick
}) => {
    const { isDark } = useTheme();

    return (
        <div
            className={`
                relative overflow-hidden rounded-2xl 
                ${isDark
                    ? 'bg-[#151b27] border border-white/[0.06]'
                    : 'bg-white border border-neutral-200/50 shadow-sm'
                }
                ${hover ? `transition-all duration-200 ${onClick ? 'cursor-pointer' : ''} hover:-translate-y-1 ${isDark
                        ? 'hover:border-white/[0.1]'
                        : 'hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50'
                    }` : ''}
                ${padding}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};

/**
 * Premium Button Component
 * Apple-inspired buttons with depth and shine
 */
export const PremiumButton = ({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    className = '',
    onClick,
    type = 'button'
}) => {
    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-5 py-3 text-sm',
        lg: 'px-6 py-3.5 text-base'
    };

    const variants = {
        primary: `
            bg-gradient-to-b from-indigo-500 to-indigo-600 text-white
            shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_4px_12px_rgba(99,102,241,0.35),inset_0_1px_0_rgba(255,255,255,0.15)]
            hover:from-indigo-400 hover:to-indigo-500
            hover:shadow-[0_0_0_1px_rgba(99,102,241,0.5),0_6px_16px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.2)]
            hover:-translate-y-0.5
            active:translate-y-0 active:scale-[0.99]
        `,
        secondary: `
            bg-white text-neutral-700 border border-neutral-200
            shadow-sm hover:bg-neutral-50 hover:border-neutral-300
            hover:-translate-y-0.5
            dark:bg-[#232938] dark:text-neutral-200 dark:border-white/[0.08]
            dark:hover:bg-[#2d3548] dark:hover:border-white/[0.12]
        `,
        ghost: `
            bg-transparent text-neutral-600
            hover:bg-neutral-100
            dark:text-neutral-400 dark:hover:bg-white/[0.06]
        `,
        danger: `
            bg-gradient-to-b from-red-500 to-red-600 text-white
            shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_4px_12px_rgba(239,68,68,0.35)]
            hover:from-red-400 hover:to-red-500
            hover:shadow-[0_0_0_1px_rgba(239,68,68,0.5),0_6px_16px_rgba(239,68,68,0.4)]
            hover:-translate-y-0.5
        `
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
                inline-flex items-center justify-center gap-2
                font-semibold rounded-xl
                transition-all duration-150
                disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                ${sizes[size]}
                ${variants[variant]}
                ${className}
            `}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : null}
            {children}
        </button>
    );
};

/**
 * Premium Input Component
 * Enhanced form inputs with refined focus states
 */
export const PremiumInput = ({
    label,
    icon: Icon,
    error,
    className = '',
    ...props
}) => {
    const { isDark } = useTheme();

    return (
        <div className={`space-y-2 ${className}`}>
            {label && (
                <label className={`text-sm font-semibold ${isDark ? 'text-neutral-300' : 'text-neutral-700'}`}>
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors duration-150 ${isDark
                            ? 'text-neutral-500 group-focus-within:text-indigo-400'
                            : 'text-neutral-400 group-focus-within:text-indigo-500'
                        }`} />
                )}
                <input
                    className={`
                        w-full py-3.5 rounded-xl font-medium transition-all duration-150
                        ${Icon ? 'pl-12 pr-4' : 'px-4'}
                        ${isDark
                            ? 'bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-neutral-500 hover:border-white/[0.12] focus:border-indigo-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-indigo-500/20'
                            : 'bg-white border-1.5 border-neutral-200 text-neutral-900 placeholder:text-neutral-400 hover:border-neutral-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10'
                        }
                        focus:outline-none
                        ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
            )}
        </div>
    );
};

/**
 * Premium Badge Component
 * Status badges with gradient backgrounds
 */
export const PremiumBadge = ({
    children,
    variant = 'default',
    size = 'md',
    className = ''
}) => {
    const { isDark } = useTheme();

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1.5 text-xs',
        lg: 'px-4 py-2 text-sm'
    };

    const variants = {
        default: isDark
            ? 'bg-neutral-700 text-neutral-300'
            : 'bg-neutral-100 text-neutral-600',
        primary: isDark
            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
            : 'bg-indigo-100 text-indigo-700',
        success: isDark
            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-emerald-100 text-emerald-700',
        warning: isDark
            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            : 'bg-amber-100 text-amber-700',
        error: isDark
            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
            : 'bg-red-100 text-red-700'
    };

    return (
        <span className={`
            inline-flex items-center gap-1.5 rounded-full font-semibold
            ${sizes[size]}
            ${variants[variant]}
            ${className}
        `}>
            {children}
        </span>
    );
};

/**
 * Premium Stat Card Component
 * Sophisticated stat display with gradients and animations
 */
export const PremiumStatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    gradient = 'from-indigo-500 to-purple-600',
    className = ''
}) => {
    const { isDark } = useTheme();

    return (
        <div className={`
            group relative overflow-hidden rounded-2xl p-6 transition-all duration-200 hover:-translate-y-1
            ${isDark
                ? 'bg-[#151b27] border border-white/[0.06] hover:border-white/[0.1]'
                : 'bg-white border border-neutral-200/50 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50'
            }
            ${className}
        `}>
            {/* Accent top bar on hover */}
            <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />

            {/* Background gradient on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDark ? 'bg-gradient-to-br from-white/[0.02] to-transparent' : 'bg-gradient-to-br from-indigo-50/50 to-transparent'
                }`} />

            <div className="relative flex justify-between items-start">
                <div className="space-y-1">
                    <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        {title}
                    </p>
                    <h3 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-neutral-900'}`}>
                        {value}
                    </h3>
                </div>

                {Icon && (
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-200 group-hover:scale-110`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>

            {(subtitle || trend) && (
                <div className="relative mt-4 flex items-center gap-2">
                    {trend && (
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${trend.positive
                                ? isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                                : isDark ? 'bg-red-500/15 text-red-400' : 'bg-red-50 text-red-600'
                            }`}>
                            {trend.value}
                        </span>
                    )}
                    {subtitle && (
                        <span className={`text-sm ${isDark ? 'text-neutral-500' : 'text-neutral-400'}`}>
                            {subtitle}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

/**
 * Premium Avatar Component
 * Avatar with gradient background and glow effect
 */
export const PremiumAvatar = ({
    name,
    size = 'md',
    gradient = 'from-indigo-500 to-purple-600',
    showOnline = false,
    className = ''
}) => {
    const { isDark } = useTheme();

    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-xl'
    };

    return (
        <div className={`relative group ${className}`}>
            <div className={`absolute -inset-0.5 bg-gradient-to-br ${gradient} rounded-xl opacity-50 blur-[2px] group-hover:opacity-75 transition-opacity duration-200`} />
            <div className={`
                relative rounded-xl bg-gradient-to-br ${gradient}
                flex items-center justify-center text-white font-bold shadow-lg
                ${sizes[size]}
            `}>
                {name?.charAt(0) || 'U'}
            </div>
            {showOnline && (
                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 ${isDark ? 'border-[#151b27]' : 'border-white'}`} />
            )}
        </div>
    );
};

/**
 * Premium Divider Component
 */
export const PremiumDivider = ({ className = '' }) => {
    return (
        <div className={`h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-700 ${className}`} />
    );
};
