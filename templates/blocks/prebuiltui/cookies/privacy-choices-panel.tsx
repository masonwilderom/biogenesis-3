import React from "react";

export default function Example() {
    return (
        <div className="w-80 bg-white text-gray-500 p-4 md:p-6 rounded-lg border border-gray-500/30 text-sm">
            <h2 className="text-gray-800 text-xl font-medium pb-3">We care about your privacy</h2>
            <p>This website uses cookies for functionality, analytics, and marketing. By accepting, you agree to our <a href="#" className="font-medium underline">Cookie Policy</a>.</p>
            <div className="flex items-center justify-center mt-6 gap-4">
                <button type="button" className="font-medium px-8 border border-gray-500/30 py-2 rounded hover:bg-blue-500/10 transition active:scale-95">Decline</button>
                <button type="button" className="font-medium px-8 border border-gray-500/30 py-2 rounded hover:bg-blue-500/10 transition active:scale-95">Settings</button>
            </div>
            <button type="button" className="bg-indigo-600 w-full py-2 mt-4 rounded text-white font-medium active:scale-95 transition">Accept</button>
        </div>
    );
};