export default function Example() {
    return (
        <div className="max-w-80 overflow-hidden rounded-lg shadow">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 text-white">
                <h3 className="text-xl font-bold">Premium</h3>
                <div className="mt-4 flex items-baseline">
                    <span className="text-4xl font-bold">$49</span>
                    <span className="ml-1">/month</span>
                </div>
            </div>
            <div className="bg-white p-6">
                <p className="mb-6 text-gray-600">Everything you need for advanced projects and teams.</p>
                <ul className="mb-6 space-y-1 text-sm text-gray-500">
                    <li className="flex items-start">
                        <svg className="mt-0.5 mr-2 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Unlimited everything</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="mt-0.5 mr-2 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>24/7 support</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="mt-0.5 mr-2 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="mt-0.5 mr-2 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Custom integrations</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="mt-0.5 mr-2 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Service level agreement</span>
                    </li>
                    <li className="flex items-start">
                        <svg className="mt-0.5 mr-2 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Dedicated account manager</span>
                    </li>
                </ul>
                <button className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm text-white transition-opacity hover:opacity-90">Get Premium</button>
            </div>
        </div>
    );
};