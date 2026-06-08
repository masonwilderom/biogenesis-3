export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center gap-12">
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-16 h-8 bg-black rounded-full peer peer-checked:bg-slate-300 transition-colors duration-200"></div>
                <span className="dot absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-8"></span>
                Enable Feature
            </label>
            <label className="relative inline-flex items-center cursor-pointer text-gray-900 gap-3">
                <input type="checkbox" className="sr-only peer" checked />
                <div className="w-16 h-8 bg-black rounded-full peer peer-checked:bg-slate-300 transition-colors duration-200"></div>
                <span className="dot absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-8"></span>
                Feature Enabled
            </label>
        </div>
    );
};