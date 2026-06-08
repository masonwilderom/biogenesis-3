export default function Example() {
    return (
        <div className="flex flex-col items-center justify-center p-6 md:p-14 w-full bg-blue-700 text-white">
            <a className="mb-8 md:mb-12" href="https://prebuiltui.com">
                <img className="h-10" src="https://prebuiltui.com/logo.svg?p=white&s=white&t=white" alt="logo white" />
            </a>
            <div className="flex flex-col items-center">
                <p className="md:text-3xl text-xl text-center">Our learners are at the heart of everything we do. Explore their inspiring stories of growth, success, and how we helped them achieve their goals.</p>
                <div className="flex items-center gap-2 mt-8">
                    <img className="w-12 h-12 md:w-16 md:h-16 rounded-full" src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=100" alt="profileImg1" />
                    <div className="text-sm">
                        <p className="font-medium text-lg">Donald Jackman</p>
                        <p>SWE 1 @ Amazon</p>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 mt-8">
                <div className="w-3 h-3 md:w-4 md:h-4 bg-white rounded-full"></div>
                <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-400 rounded-full"></div>
                <div className="w-3 h-3 md:w-4 md:h-4 bg-slate-400 rounded-full"></div>
            </div>
        </div>
    );
};