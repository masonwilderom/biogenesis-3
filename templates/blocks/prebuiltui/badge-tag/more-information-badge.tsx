"use client";

import React from "react";


export default function Example() {
    return (
        <a href="#" className="flex items-center gap-2 border border-indigo-200 rounded-full p-1 pr-3 text-sm font-medium text-indigo-500 bg-indigo-50">
            <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                NEW
            </span>
            <p className="flex items-center gap-1">
                <span>Click here for more information</span>
                <svg className="mt-1" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </p>
        </a>
    );
};