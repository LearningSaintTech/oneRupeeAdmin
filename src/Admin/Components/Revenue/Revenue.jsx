import React from "react";
import { FaSearch, FaBell, FaCalendarAlt } from "react-icons/fa";
import profilePic from "../../../assets/images/Profile Picture (1).svg";

// User Growth Chart Component
const UserGrowthChart = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-6">
        <button className="px-4 py-2 border border-teal-500 text-teal-700 rounded-md flex items-center gap-2">
          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
          Users
        </button>
        <div className="border border-yellow-400 rounded-md px-4 py-2 flex items-center gap-2">
          <span className="text-sm text-gray-700">March 2020</span>
          <FaCalendarAlt className="text-yellow-400" />
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-80">
        {/* Y-axis Labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-sm text-gray-600">
          <span>60k</span>
          <span>50k</span>
          <span>40k</span>
          <span>30k</span>
          <span>20k</span>
          <span>10k</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-12 h-full flex items-end justify-between">
          {/* Grid Lines */}
          <div className="absolute left-12 right-0 h-full">
            {[0, 1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${(i * 100) / 6}%` }}
              ></div>
            ))}
          </div>

          {/* Bars */}
          <div className="relative flex items-end gap-4 h-full">
            {/* Jan 1 - Stacked bars */}
            <div className="flex flex-col items-center">
              <div className="w-8 bg-blue-600 rounded-t-sm" style={{ height: '18px' }}></div>
              <div className="w-8 bg-blue-400 rounded-t-sm" style={{ height: '42px' }}></div>
              <span className="text-xs text-gray-600 mt-2">Jan 1</span>
            </div>

            {/* Jan 2 - Stacked bars */}
            <div className="flex flex-col items-center">
              <div className="w-8 bg-blue-600 rounded-t-sm" style={{ height: '33px' }}></div>
              <span className="text-xs text-gray-600 mt-2">Jan 2</span>
            </div>

            {/* Jan 3 with Tooltip */}
            <div className="flex flex-col items-center relative">
              <div className="w-8 bg-blue-600 rounded-t-sm" style={{ height: '83px' }}></div>
              {/* Tooltip */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded px-2 py-1 text-sm shadow-sm">
                41,000
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-200"></div>
              </div>
              <span className="text-xs text-gray-600 mt-2">Jan 3</span>
            </div>

            {/* Jan 4 - Stacked bars */}
            <div className="flex flex-col items-center">
              <div className="w-8 bg-blue-600 rounded-t-sm" style={{ height: '100px' }}></div>
              <span className="text-xs text-gray-600 mt-2">Jan 4</span>
            </div>

            {/* Jan 5 - Stacked bars */}
            <div className="flex flex-col items-center">
              <div className="w-8 bg-blue-600 rounded-t-sm" style={{ height: '85px' }}></div>
              <span className="text-xs text-gray-600 mt-2">Jan 5</span>
            </div>

            {/* Jan 6 - Stacked bars */}
            <div className="flex flex-col items-center">
              <div className="w-8 bg-blue-600 rounded-t-sm" style={{ height: '84px' }}></div>
              <span className="text-xs text-gray-600 mt-2">Jan 6</span>
            </div>

            {/* Jan 7 - Stacked bars */}
            <div className="flex flex-col items-center">
              <div className="w-8 bg-blue-600 rounded-t-sm" style={{ height: '93px' }}></div>
              <span className="text-xs text-gray-600 mt-2">Jan 7</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Latest Users Table Component
const LatestUsersTable = () => {
  const users = [
    {
      id: "01",
      name: "Liam Johnson",
      course: "Data Science",
      contact: "+91 98765 43210",
      email: "john.doe@example.com"
    },
    {
      id: "02",
      name: "Emma Smith",
      course: "Web Development",
      contact: "+91 87654 32109",
      email: "emma.smith@example.com"
    },
    {
      id: "03",
      name: "Noah Brown",
      course: "Graphic Design",
      contact: "+91 76543 21098",
      email: "noah.brown@example.com"
    },
    {
      id: "04",
      name: "Olivia Wilson",
      course: "Digital Marketing",
      contact: "+91 65432 10987",
      email: "olivia.wilson@example.com"
    },
    {
      id: "05",
      name: "James Taylor",
      course: "Product Management",
      contact: "+91 54321 09876",
      email: "james.taylor@example.com"
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-800 px-6 pt-6 mb-4">Latest Users</h2>
      
      {/* Table Header - Full Width Yellow */}
      <div className="w-full bg-yellow-400 py-4 px-6">
        <div className="grid grid-cols-5 gap-4 text-white font-semibold text-center">
          <div>S.N.</div>
          <div>User Name</div>
          <div>Course</div>
          <div>Contact</div>
          <div>Email ID</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="px-6 pb-6">
        <div className="space-y-3">
          {users.map((user) => (
            <div key={user.id} className="grid grid-cols-5 gap-4 py-3 border-b border-gray-100">
              <div className="text-center text-gray-700 font-medium">{user.id}</div>
              <div className="flex items-center gap-3 justify-center">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-gray-700">{user.name}</span>
              </div>
              <div className="text-center text-gray-700">{user.course}</div>
              <div className="text-center text-gray-600">{user.contact}</div>
              <div className="text-center text-gray-600">{user.email}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Revenue Component
const Revenue = () => {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Users</h1>
        
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-700">
            Tue, <span className="font-semibold">03:47 PM</span>
          </span>
          
          <div className="relative">
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-64 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          <div className="relative">
            <FaBell className="text-gray-600 text-xl cursor-pointer" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
          
          <img
            src={profilePic}
            alt="profile"
            className="w-10 h-10 rounded-full object-cover"
          />
        </div>
      </div>

      <UserGrowthChart />
      <LatestUsersTable />
    </div>
  );
};

export default Revenue;