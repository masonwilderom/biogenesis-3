import React from "react";

export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-14">
            <label className="flex gap-3 items-center cursor-pointer">
                <input type="checkbox" className="hidden peer" />
                <span className="w-5 h-5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:after:content-[''] peer-checked:after:w-2.5 peer-checked:after:h-2.5 peer-checked:after:bg-blue-600 peer-checked:border-blue-600 peer-checked:after:rounded peer-checked:after:absolute"></span>
                <span className="text-gray-700 select-none">Enable Feature</span>
            </label>
        
            <label className="flex gap-3 items-center cursor-pointer">
                <input type="checkbox" checked className="hidden peer" />
                <span className="w-5 h-5 border border-slate-300 rounded relative flex items-center justify-center peer-checked:after:content-[''] peer-checked:after:w-2.5 peer-checked:after:h-2.5 peer-checked:after:bg-blue-600 peer-checked:border-blue-600 peer-checked:after:rounded peer-checked:after:absolute"></span>
                <span className="text-gray-700 select-none">Feature Enabled</span>
            </label>
        </div>
    );
};