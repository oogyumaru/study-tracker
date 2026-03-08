import React from 'react';

export const Card = ({ children, className = "" }) => (
    <div className={`glass-card p-6 ${className}`}>
        {children}
    </div>
);
