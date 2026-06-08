import React from "react";


export default function Example() {
    return (
        <div className="flex flex-col w-32 text-sm">
            <button className="peer w-full text-left px-4 pr-2 py-2 border rounded bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none">
                <span>Open Menu</span>
            </button>
        
            <ul className="hidden overflow-hidden right-0 peer-focus:block w-40 bg-white border border-gray-300 rounded shadow-md mt-2 py-1">
                <li className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer">New file</li>
                <li className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer">Copy link</li>
                <li className="px-4 py-2 hover:bg-gray-500/10 cursor-pointer">Edit file</li>
                <li className="px-4 py-2 hover:bg-red-500/10 text-red-500 cursor-pointer">Delete file</li>
            </ul>
        </div>
    );
};