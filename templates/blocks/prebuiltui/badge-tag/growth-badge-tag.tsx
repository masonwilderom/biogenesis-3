"use client";

import React from "react";


export default function Example() {
    return (
        <div className="flex items-center gap-2 text-sm text-blue-800 bg-blue-400/10 border border-indigo-200 rounded-full px-4 py-1">
            <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.4 1H13v3.6" stroke="#1E4BAF" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M13 1 7.9 6.1l-3-3L1 7" stroke="#1E4BAF" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>124 Applicants</span>
        </div>
    );
};