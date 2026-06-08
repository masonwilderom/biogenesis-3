import { XIcon } from "lucide-react";

export default function Banner() {
  return (
    <>
      <div className="w-full bg-gradient-to-r from-[#4F39F6] to-[#FDFEFF] py-2.5 text-center text-sm font-medium text-white">
        <p>
          <span className="mr-2 rounded-md bg-white px-3 py-1 text-indigo-600">Launch offer</span>
          Try prebuiltui today and get $50 free credits
        </p>
      </div>

      {/* fake content */}
      <div className="h-60"></div>
    </>
  );
}
