"use client";

import React from "react";

export default function Example() {
    return (
        <div className="flex items-center space-x-2.5 border border-violet-500/30 rounded-full bg-violet-500/20 p-1 text-sm text-violet-600">
            <div className="flex items-center space-x-1 bg-violet-500 text-white border border-violet-500 rounded-3xl px-3 py-1">
                <p>Exclusive Offer</p>
            </div>
            <p className="pr-3">Flat 50% off on Premium collection!</p>
        </div>
    );
};