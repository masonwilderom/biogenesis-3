import React from "react";
export default function Example() {
    return (
        <div className="flex flex-col items-center w-96 bg-white text-gray-500 text-center p-6 rounded-lg border border-gray-500/30 text-sm">
            <img className="w-14 h-14" src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/cookies/cookieImage1.svg" alt="cookieImage1" />
            <h2 className="text-gray-800 text-xl font-medium pb-3 mt-2">We care about your privacy</h2>
            <p className="w-11/12">This website uses cookies for functionality, analytics, and marketing. By accepting, you agree to our <a href="#" className="font-medium underline">Cookie Policy</a>.</p>
            <div className="flex items-center justify-center mt-6 gap-4 w-full">
                <button type="button" className="font-medium px-8 border border-gray-500/30 py-2 rounded hover:bg-blue-500/10 active:scale-95 transition">Decline</button>
                <button type="button" className="bg-indigo-600 px-8 py-2 rounded text-white font-medium active:scale-95 transition">Accept</button>
            </div>
        </div>
    );
};