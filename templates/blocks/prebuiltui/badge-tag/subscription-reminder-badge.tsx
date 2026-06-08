"use client";

import React from "react";


export default function Example() {
    return (
        <div className="flex items-center space-x-2.5 border border-blue-500/30 rounded-full bg-blue-500/20 p-1 text-sm text-blue-600">
            <div className="flex items-center space-x-1 bg-blue-500 text-white border border-blue-500 rounded-3xl px-3 pl-1 py-1">
                <img className="h-6 w-6 rounded-full" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50" alt="userImage" />
                <p>Richard</p>
            </div>
            <p className="pr-3">Your subscription renews on 22 March</p>
        </div>
    );
};