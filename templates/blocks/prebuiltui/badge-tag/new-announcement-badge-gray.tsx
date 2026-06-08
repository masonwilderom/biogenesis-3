"use client";

import React from "react";


export default function Example() {
    return (
        <div className="flex items-center gap-2 border border-gray-300 rounded-full px-3 py-1 text-sm">
            <p className="text-slate-500">Announcing our next round of funding.</p>
            <a href="#" className="flex items-center gap-1 text-indigo-600 font-medium">
                Read more
                <svg className="mt-0.5" width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.959 9.5h11.083m0 0L9.501 3.96m5.541 5.54-5.541 5.542" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </a>
        </div>
    );
};