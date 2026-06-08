import React from "react";


export default function Example() {
    return (
        <div className="p-4 bg-white rounded-lg shadow text-sm max-w-80">
            <img className="rounded-md max-h-40 w-full object-cover" src="https://images.unsplash.com/photo-1560264418-c4445382edbc?q=80&w=400" alt="officeImage" />
            <p className="text-gray-900 text-xl font-semibold ml-2 mt-2">Your Card Title</p>
            <p className="text-gray-500 mt-3 ml-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore..</p>
            <button type="button" className="bg-indigo-600 mt-4 mb-3 ml-2 px-6 py-2 font-medium rounded text-white">Learn More</button>
        </div>
    );
};