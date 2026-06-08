export default function Example() {
  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-between bg-gradient-to-r from-violet-500 to-purple-100 px-4 py-2 text-center text-sm font-medium text-white md:px-14">
        <p>Build Faster with Responsive Tailwind CSS Templates</p>
        <a
          href="https://prebuiltui.com"
          className="ml-3 flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1 text-violet-600 transition hover:bg-slate-100 active:scale-95">
          Explore now
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M2.91797 7H11.0846"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 2.9165L11.0833 6.99984L7 11.0832"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>

      {/* fake content */}
      <div className="h-60"></div>
    </>
  );
}
