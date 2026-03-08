import React from 'react';

export const InputGroup = ({ label, value, onChange, type = "text", placeholder, max }) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-600">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            max={max}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/50"
        />
    </div>
);
