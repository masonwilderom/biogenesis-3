import React from "react";

export default function Example() {
  return (
    <div className="group w-52 h-64 mx-auto [perspective:1000px] cursor-pointer">
      <div className="relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front Side */}
        <div className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center rounded-md bg-white border border-gray-200">
          Front Side
        </div>

        {/* Back Side */}
        <div className="absolute w-full h-full [backface-visibility:hidden] flex items-center justify-center rounded-md bg-indigo-600 text-white [transform:rotateY(180deg)]">
          Back Side
        </div>
      </div>
    </div>
  );
}