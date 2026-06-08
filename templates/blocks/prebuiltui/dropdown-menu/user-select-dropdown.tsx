import React from "react";
const App = () => {
    const users = [
        {
            name: "James Washington",
            image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=50",
        },
        {
            name: "Richard Nelson",
            image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=50",
        },
        {
            name: "Donald Jackman",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=50&h=50&auto=format&fit=crop",
        },
    ];

    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedUser, setSelectedUser] = React.useState(users[0]);

    const handleSelect = (user) => {
        setSelectedUser(user);
        setIsOpen(false);
    };

    return (
        <div className="flex flex-col w-64 text-sm relative">
            <p className="font-medium text-gray-800 pb-2">Assigned to</p>

            <button type="button" onClick={() => setIsOpen(!isOpen)} className="group flex items-center justify-between w-full text-left px-2 py-2 border rounded bg-white text-gray-700 border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none">
                <div className="flex items-center gap-2">
                    <img className="w-6 h-6 rounded-full" src={selectedUser.image} alt={selectedUser.name} />
                    <span>{selectedUser.name}</span>
                </div>
                <svg width="11" height="17" viewBox="0 0 11 17" fill="none" xmlns="http://www.w3.org/2000/svg" >
                    <path d="M9.92546 6L5.68538 1L1.44531 6" stroke="#6B7280" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M1.44564 11L5.68571 16L9.92578 11" stroke="#6B7280" strokeOpacity="0.7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {isOpen && (
                <ul className="w-64 bg-white border border-gray-300 rounded shadow-md mt-1 py-2 right-0">
                    {users.map((user) => (
                        <li key={user.name} className={`px-2 py-2 flex items-center gap-2 cursor-pointer ${user.name === selectedUser.name ? "bg-indigo-500 text-white" : "hover:bg-indigo-500 hover:text-white"}`} onClick={() => handleSelect(user)} >
                            <img className="w-6 h-6 rounded-full" src={user.image} alt={user.name} />
                            <span>{user.name}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
export default App;