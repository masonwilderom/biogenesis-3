"use client";

import React from "react";

export default function Example() {
    return (
        <div className="flex items-center gap-2 p-1 pr-3 text-sm text-slate-500">
            <span className="text-indigo-600 border font-medium border-indigo-200 rounded-full px-3 py-1">What's new?</span>
            <a href="#" className="flex items-center gap-1 px-1">
                Just released v4.3.1
                <svg className="mt-0.5" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </a>
        </div>
    );
};