export default function Example() {
    return (
        <div className="p-6 bg-white rounded-lg border-2 border-gray-800 w-80 shadow-lg">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-xl font-bold">Enterprise</h3>
                    <p className="text-gray-500 mt-1">Custom solutions for large organizations</p>
                </div>
                <span className="text-sm font-medium px-2.5 py-0.5 rounded bg-gray-100">Custom</span>
            </div>
        
            <div className="mt-6 flex items-baseline">
                <span className="text-2xl font-semibold">Contact Us</span>
            </div>
        
            <ul className="mt-6 space-y-1 text-gray-500 text-sm">
                <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Unlimited everything</span>
                </li>
                <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>24/7 phone & email support</span>
                </li>
                <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Dedicated account manager</span>
                </li>
                <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Custom integrations</span>
                </li>
                <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Service level agreement</span>
                </li>
                <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Advanced security features</span>
                </li>
            </ul>
        
            <button className="mt-8 w-full py-2.5 px-4 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition-colors">
                Schedule a Demo
            </button>
        </div>
    );
};