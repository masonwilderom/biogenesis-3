export default function Banner() {
  return (
    <>
      <div className="flex w-full items-center justify-between bg-gradient-to-r from-violet-500 via-[#9938CA] to-[#E0724A] px-4 py-1 text-center text-sm font-medium text-white md:px-14">
        <p>Get 20% OFF on Your First Order!</p>
        <div className="flex items-center space-x-6">
          <button
            type="button"
            className="rounded-full bg-white px-7 py-2 font-normal text-gray-800">
            Claim Offer
          </button>
          <button type="button">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg">
              <rect
                y="12.532"
                width="17.498"
                height="2.1"
                rx="1.05"
                transform="rotate(-45.74 0 12.532)"
                fill="#fff"
              />
              <rect
                x="12.533"
                y="13.915"
                width="17.498"
                height="2.1"
                rx="1.05"
                transform="rotate(-135.74 12.533 13.915)"
                fill="#fff"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* fake content */}
      <div className="h-60"></div>
    </>
  );
}
