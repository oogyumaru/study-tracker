import React from 'react';

export const Button = ({ onClick, children, variant = "primary", className = "", icon: Icon, type = "button" }) => {
    const baseStyle = "px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-all shadow-sm";
    const variants = {
        primary: "btn-primary",
        secondary: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
    };

    return (
        <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
            {Icon && <Icon size={18} />}
            {children}
        </button>
    );
};
