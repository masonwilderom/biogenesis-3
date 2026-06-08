"use client";

import React from "react";

export default function Example() {
    return (
        <div className="flex items-center gap-2 border border-indigo-200 rounded-full p-1 pr-3 text-sm text-slate-500">
            <span className="text-indigo-600 pl-2 font-medium pr-1">We're hiring</span>
            <div className="h-6 w-px bg-gray-300"></div>
            <a href="#" className="flex items-center gap-1 px-1">
                See open positions
                <svg className="mt-1" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </a>
        </div>
    );
};