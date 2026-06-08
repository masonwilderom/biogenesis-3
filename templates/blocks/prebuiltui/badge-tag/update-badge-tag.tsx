"use client";

import React from "react";

export default function Example() {
    return (
        <div className="flex items-center space-x-2.5 border border-green-500/30 rounded-full bg-green-500/20 p-1 text-sm text-green-600">
            <p className="pl-3">It will take approximate 2GB memory</p>
            <div className="flex items-center space-x-1 bg-green-500 text-white border border-green-500 rounded-2xl px-3 py-1">
                <p>Update</p>
                <svg width="14" height="11" viewBox="0 0 16 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 6.5h14M9.5 1 15 6.5 9.5 12" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>
        </div>
    );
};