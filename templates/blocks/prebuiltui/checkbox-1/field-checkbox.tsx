import React from "react";

export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-14">
            <label className="flex gap-3 items-center cursor-pointer">
                <input type="checkbox" className="hidden peer" />
                <span className="w-5 h-5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-600">
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m10.092.952-.005-.006-.006-.005A.45.45 0 0 0 9.43.939L4.162 6.23 1.585 3.636a.45.45 0 0 0-.652 0 .47.47 0 0 0 0 .657l.002.002L3.58 6.958a.8.8 0 0 0 .567.242.78.78 0 0 0 .567-.242l5.333-5.356a.474.474 0 0 0 .044-.65Zm-5.86 5.349V6.3Z" fill="#F5F7FF" stroke="#F5F7FF" strokeWidth=".4"/>
                    </svg>
                </span>
                <span className="text-gray-700 select-none">Enable Feature</span>
            </label>
        
            <label className="flex gap-3 items-center cursor-pointer">
                <input type="checkbox" checked className="hidden peer" />
                <span className="w-5 h-5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:border-blue-600 peer-checked:bg-blue-600">
                    <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="m10.092.952-.005-.006-.006-.005A.45.45 0 0 0 9.43.939L4.162 6.23 1.585 3.636a.45.45 0 0 0-.652 0 .47.47 0 0 0 0 .657l.002.002L3.58 6.958a.8.8 0 0 0 .567.242.78.78 0 0 0 .567-.242l5.333-5.356a.474.474 0 0 0 .044-.65Zm-5.86 5.349V6.3Z" fill="#F5F7FF" stroke="#F5F7FF" strokeWidth=".4"/>
                    </svg>
                </span>
                <span className="text-gray-700 select-none">Feature Enabled</span>
            </label>
        </div>
    );
};