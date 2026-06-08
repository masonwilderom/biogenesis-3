export default function Example() {
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
            
                * {
                    font-family: 'Poppins', sans-serif;
                }
            `}</style>
            
            <div className="max-md:px-4">
                <p className="bg-gradient-to-r from-slate-800 to-[#4D6EA3] text-transparent bg-clip-text text-3xl text-left max-w-2xl">Trusted by world’s leading companies.</p>
                <div className="flex flex-col-reverse md:flex-row items-center justify-center max-h-[450px] gap-6 mt-6">
                    <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-7.svg" alt="features showcase" className="hover:-translate-y-1 transition-all duration-300 " />
                    <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/features/image-8.svg" alt="features showcase" className="hover:-translate-y-1 transition-all duration-300 max-md:w-full" />
                </div>
            </div>
        </>
    );
};