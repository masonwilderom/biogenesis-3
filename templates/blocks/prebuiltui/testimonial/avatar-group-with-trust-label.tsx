export default function Example() {
    return (
        <div className="flex flex-wrap items-center justify-center p-1 rounded-full bg-white border border-gray-300 text-sm">
            <div className="flex items-center">
                <img className="w-[30px] rounded-full border-3 border-white"
                    src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50"
                    alt="userImage1" />
                <img className="w-[30px] rounded-full border-3 border-white -translate-x-2"
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50"
                    alt="userImage2" />
                <img className="w-[30px] rounded-full border-3 border-white -translate-x-4"
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop"
                    alt="userImage3" />
            </div>
            <p className="-translate-x-2">Trusted by 10,000+ people</p>
        </div>
    );
};