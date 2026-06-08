export default function Example() {
    return (
        <div className="flex flex-col items-center text-slate-800">
            <h2 className="text-3xl font-medium mb-10">
                Happy
                <span className="text-indigo-500 font-bold">
                    Clients
                </span>
            </h2>
            <div className="flex items-center -space-x-3">
                <div className="relative group flex flex-col items-center">
                    <p className="opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-100 transition duration-300 mb-3 px-2 py-1 text-sm font-medium">Michael</p>
                    <img src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200" alt="image"
                        className="w-20 h-20 rounded-full border-4 border-white hover:-translate-y-1 transition hover:scale-110" />
                </div>
                <div className="relative group flex flex-col items-center">
                    <p className="opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-100 transition duration-300 mb-3 px-2 py-1 text-sm font-medium">James</p>
                    <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200" alt="image"
                        className="w-20 h-20 rounded-full border-4 border-white hover:-translate-y-1 transition hover:scale-110" />
                </div>
                <div className="relative group flex flex-col items-center">
                    <p className="opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-100 transition duration-300 mb-3 px-2 py-1 text-sm font-medium">Emily</p>
                    <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop"
                        alt="image" className="w-20 h-20 rounded-full border-4 border-white hover:-translate-y-1 transition hover:scale-110" />
                </div>
                <div className="relative group flex flex-col items-center">
                    <p className="opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-100 transition duration-300 mb-3 px-2 py-1 text-sm font-medium">John</p>
                    <img src="https://randomuser.me/api/portraits/men/75.jpg" alt="image"
                        className="w-20 h-20 rounded-full border-4 border-white hover:-translate-y-1 transition hover:scale-110" />
                </div>
            </div>
        </div>
    );
};