"use client";

import React from "react";


export default function Example() {
    return (
        <div className="flex flex-wrap justify-center gap-12">
            <div className="relative border-[3px] border-blue-500 rounded-lg">
                <img className="h-20 w-20 rounded"
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200"
                    alt="userImage1" />
                <div className="absolute -top-3 -right-2 flex items-center justify-center h-5 w-10 bg-blue-500 rounded-full">
                    <p className="text-white text-xs uppercase">New</p>
                </div>
            </div>
            <div className="relative border-[3px] border-red-500 rounded-lg">
                <img className="h-20 w-20 rounded"
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200"
                    alt="userImage2" />
                <div className="absolute -top-3 -right-2 flex items-center justify-center h-5 w-10 bg-red-500 rounded-full">
                    <p className="text-white text-xs uppercase">New</p>
                </div>
            </div>
            <div className="relative border-[3px] border-yellow-500 rounded-lg">
                <img className="h-20 w-20 rounded"
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
                    alt="userImage3" />
                <div className="absolute -top-3 -right-2 flex items-center justify-center h-5 w-10 bg-yellow-500 rounded-full">
                    <p className="text-white text-xs uppercase">New</p>
                </div>
            </div>
        </div>
    );
};