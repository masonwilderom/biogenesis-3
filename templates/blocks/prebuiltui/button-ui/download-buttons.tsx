"use client";

import React from "react";

export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <button type="button" className="flex items-center justify-between text-gray-800/80 text-sm h-10 w-36 pl-4 bg-white border active:scale-95 transition border-gray-500/30">
                Download
                <div className="bg-gray-500/20 h-full flex items-center justify-center px-3">
                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 13.125v3.5c0 .464-.176.91-.488 1.237a1.63 1.63 0 0 1-1.179.513H4.167c-.442 0-.866-.184-1.179-.513a1.8 1.8 0 0 1-.488-1.237v-3.5M5.833 8.75 10 13.125m0 0 4.167-4.375M10 13.125v-10.5" stroke="#1F2937" strokeOpacity=".8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
            </button>
            <button type="button" className="flex items-center justify-between text-gray-800/80 rounded text-sm h-10 w-36 pr-7 bg-white border border-gray-500/30 active:scale-95 transition">
                <div className="h-full flex items-center justify-center px-3">
                    <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 13.125v3.5c0 .464-.176.91-.488 1.237a1.63 1.63 0 0 1-1.179.513H4.167c-.442 0-.866-.184-1.179-.513a1.8 1.8 0 0 1-.488-1.237v-3.5M5.833 8.75 10 13.125m0 0 4.167-4.375M10 13.125v-10.5" stroke="#1F2937" strokeOpacity=".8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                Download
            </button>
            <button type="button" className="flex items-center justify-between text-sm h-10 w-36 rounded-full pr-7 bg-white border border-indigo-600 text-indigo-600 active:scale-95 transition">
                <div className="bg-indigo-600 ml-1 rounded-full h-7 w-7 flex items-center justify-center">
                    <svg width="13" height="15" viewBox="0 0 13 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 1v12m6-4-5.5 5L1 9" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                Download
            </button>
            <button type="button" className="bg-white border border-gray-500/30 text-gray-800/80 w-max px-4 py-2 rounded active:scale-95 transition">
                <svg width="21" height="21" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.375 13.125v3.5a1.75 1.75 0 0 1-1.75 1.75H4.375a1.75 1.75 0 0 1-1.75-1.75v-3.5m3.5-4.375 4.375 4.375m0 0 4.375-4.375M10.5 13.125v-10.5" stroke="#1F2937" strokeOpacity=".8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </button>
            <button type="button" className="flex items-center justify-between relative overflow-hidden text-gray-800/80 rounded active:scale-95 transition text-sm h-10 w-36 pr-7 bg-white border border-gray-500/30">
                <div className="bg-gray-500/30 h-6 w-1 -ml-px rounded-r-sm absolute"></div>
                <div className="bg-gray-500/30 h-6 w-1 -mr-px right-0 rounded-l-sm absolute"></div>
                <div className="h-full flex items-center justify-center px-3">
                    <svg width="23" height="19" viewBox="0 0 23 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m7.438 13.985 3.77 3.77 3.769-3.77m-3.774-4.712v8.482" stroke="#1F2937" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M19.576 15.012a4.712 4.712 0 0 0-2.714-8.567h-1.188a7.54 7.54 0 1 0-12.949 6.87" stroke="#1F2937" strokeOpacity=".8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                Download
            </button>
        </div>
    );
};