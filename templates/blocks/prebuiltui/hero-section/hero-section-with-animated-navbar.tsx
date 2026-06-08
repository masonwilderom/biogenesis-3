'use client';

import React from 'react';

export default function DarkGradientHero() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    if (mobileOpen) {
      document.addEventListener('keydown', onEsc);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.removeEventListener('keydown', onEsc);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');
        * { font-family: 'Poppins', sans-serif; }
      `}</style>
<section
  className="relative flex flex-col items-center justify-center 
             w-full min-h-screen bg-black text-white 
             bg-[url('https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/hero/bg-gradient-3.svg')] 
             bg-center bg-cover pb-16 pt-8"
>
        <nav className="flex items-center border mx-auto w-full max-w-7xl px-6 py-4 border-slate-700 rounded-full text-white text-sm">
          <a href="https://prebuiltui.com" aria-label="PrebuiltUI home">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <circle cx="4.706" cy="16" r="4.706" fill="#D9D9D9" />
              <circle cx="16.001" cy="4.706" r="4.706" fill="#D9D9D9" />
              <circle cx="16.001" cy="27.294" r="4.706" fill="#D9D9D9" />
              <circle cx="27.294" cy="16" r="4.706" fill="#D9D9D9" />
            </svg>
          </a>

          <div className="hidden md:flex items-center gap-6 ml-7">
            {['Products', 'Stories', 'Pricing', 'Docs'].map((label) => (
              <a key={label} href="#" className="relative overflow-hidden h-6 group">
                <span className="block group-hover:-translate-y-full transition-transform duration-300">{label}</span>
                <span className="block absolute top-full left-0 group-hover:translate-y-[-100%] transition-transform duration-300">{label}</span>
              </a>
            ))}
          </div>

          <div className="hidden ml-14 md:flex items-center gap-4">
            <button className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition">
              Contact
            </button>
            <button className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300">
              Get Started
            </button>
          </div>

          <button
            aria-label="Open menu"
            className="md:hidden text-gray-400 hover:text-gray-200"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div
            role="dialog"
            aria-modal="true"
            className={[
              'absolute top-0 left-0 w-full h-full bg-black text-base md:hidden flex-col items-center justify-center gap-4',
              mobileOpen ? 'flex' : 'hidden',
            ].join(' ')}
          >
            {['Products', 'Customer Stories', 'Pricing', 'Docs'].map((label) => (
              <a key={label} href="#" className="hover:text-indigo-400" onClick={() => setMobileOpen(false)}>
                {label}
              </a>
            ))}
            <button
              onClick={() => setMobileOpen(false)}
              className="border border-slate-600 hover:bg-slate-800 px-4 py-2 rounded-full text-sm font-medium transition"
            >
              Contact
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="bg-white hover:shadow-[0px_0px_30px_14px] shadow-[0px_0px_30px_7px] hover:shadow-white/50 shadow-white/50 text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-100 transition duration-300"
            >
              Get Started
            </button>
            <button
              aria-label="Close menu"
              className="absolute top-5 right-5 p-2 rounded-full border border-white/10 hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </nav>

        <div className="flex items-center gap-2 border border-white/15 rounded-full px-4 py-2 text-sm mt-24 mx-auto">
          <p>Explore how we help grow brands.</p>
          <a href="#" className="flex items-center gap-1 font-medium">
            Read more
            <svg className="mt-0.5" width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M3.959 9.5h11.083m0 0L9.501 3.96m5.541 5.54-5.541 5.542" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>

        <h1 className="text-4xl md:text-6xl text-center font-semibold max-w-3xl mt-5 bg-gradient-to-r from-white to-[#748298] text-transparent bg-clip-text">
          Solutions to Elevate Your Business Growth
        </h1>
        <p className="text-slate-300 md:text-base line-clamp-3 max-md:px-2 text-center max-w-2xl mt-3">
          Unlock potential with tailored strategies designed for success. Simplify challenges, maximize results, and stay ahead in the competitive market.
        </p>

        <div className="grid grid-cols-2 gap-2 mt-8 text-sm">
          <button className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-full">Get Started</button>
          <button className="flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-6 py-3">
            <span>Learn More</span>
            <svg className="mt-0.5" width="6" height="8" viewBox="0 0 6 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M1.25.5 4.75 4l-3.5 3.5" stroke="currentColor" strokeOpacity=".4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div aria-label="Photos of leaders" className="mt-12 flex max-md:overflow-x-auto gap-6 max-w-4xl w-full pb-6 mx-auto">
          <img alt="" className="w-36 h-44 rounded-lg hover:-translate-y-1 transition duration-300 object-cover flex-shrink-0" height={140} src="https://images.unsplash.com/flagged/photo-1573740144655-bbb6e88fb18a?q=80&w=735&auto=format&fit=crop" width={120} />
          <img alt="" className="w-36 h-44 rounded-lg hover:-translate-y-1 transition duration-300 object-cover flex-shrink-0" height={140} src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=687&auto=format&fit=crop" width={120} />
          <img alt="" className="w-36 h-44 rounded-lg hover:-translate-y-1 transition duration-300 object-cover flex-shrink-0" height={140} src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=687&auto=format&fit=crop" width={120} />
          <img alt="" className="w-36 h-44 rounded-lg hover:-translate-y-1 transition duration-300 object-cover flex-shrink-0" height={140} src="https://images.unsplash.com/photo-1546961329-78bef0414d7c?q=80&w=687&auto=format&fit=crop" width={120} />
          <img alt="" className="w-36 h-44 rounded-lg hover:-translate-y-1 transition duration-300 object-cover flex-shrink-0" height={140} src="https://images.unsplash.com/photo-1639149888905-fb39731f2e6c?q=80&w=764&auto=format&fit=crop" width={120} />
        </div>
      </section>
    </>
  );
}