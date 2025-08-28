import React, { useState } from 'react';
import { MdDashboard, MdEvent, MdSettings } from 'react-icons/md';
import { FiBarChart2, FiUsers, FiInbox, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: <MdDashboard size={22} />, path: '/dashboard' },
  // { label: 'Revenue', icon: <FiBarChart2 size={22} />, path: '/revenue' },
  { label: 'Users', icon: <FiUsers size={22} />, path: '/users' },
  { label: 'Courses', icon: <FiInbox size={22} />, path: '/courses' },
  { label: 'Promo', icon: <MdEvent size={22} />, path: '/promo' },
  { label: 'Notifications', icon: <FiInbox size={22} />, path: '/notifications' },
  { 
    label: 'Settings', 
    icon: <MdSettings size={22} />, 
    dropdown: true,
    subItems: [
      { label: 'Profile', path: '/settings/profile' },
      { label: 'Reviews', path: '/settings/reviews' },
      { label: 'Help Center', path: '/settings/helpcenter' },
    ]
  },
];

const Sidebar = () => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate(); // ✅ for navigation

  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const handleLogout = () => {
    // Optional: clear token / session here
    localStorage.removeItem("token"); // if you use token-based auth
    navigate("/"); // ✅ navigate to login page
  };

  return (
    <aside className="w-[200px] sm:w-[220px] lg:w-[240px] h-screen bg-[#006C99]/[0.7] border border-gray-200 rounded-[24px] flex flex-col justify-between shadow-lg fixed top-0 left-0 overflow-y-auto">
      <div className="flex flex-col flex-1">
        {/* Top spacing */}
        <div className="pt-8 sm:pt-12 lg:pt-16"></div>
        
        {/* Navigation */}
        <nav className="flex-1">
          <ul className="flex flex-col gap-2 sm:gap-3 px-3 sm:px-4">
            {navItems.map((item) => (
              <li key={item.label}>
                {!item.dropdown ? (
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 sm:gap-4 pl-3 sm:pl-4 py-2 sm:py-3 rounded-xl text-sm sm:text-[15px] transition-all relative ${
                        isActive
                          ? 'bg-[#F6B800] text-white font-semibold shadow-md'
                          : 'text-white hover:bg-[#F6B800] hover:bg-opacity-90'
                      }`
                    }
                  >
                    {({ isActive }) => isActive && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 sm:h-8 bg-[#F6B800] rounded-r-full"></div>
                    )}
                    <span className="flex items-center">{item.icon}</span>
                    <span >{item.label}</span>
                  </NavLink>
                ) : (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.label)}
                      className={`flex items-center gap-3 sm:gap-4 w-full pl-3 sm:pl-4 py-2 sm:py-3 rounded-xl text-sm sm:text-[15px] transition-all ${
                        openDropdown === item.label
                          ? 'bg-[#F6B800] text-white font-semibold shadow-md'
                          : 'text-white hover:bg-[#F6B800] hover:bg-opacity-90'
                      }`}
                    >
                      <span className="flex items-center">{item.icon}</span>
                      <span>{item.label}</span>
                      <FiChevronDown
                        className={`ml-auto transition-transform ${
                          openDropdown === item.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {openDropdown === item.label && (
                      <ul className="ml-6 sm:ml-8 lg:ml-10 mt-2 sm:mt-3 flex flex-col gap-2 sm:gap-3 bg-[#006C99] rounded-lg p-2">
                        {item.subItems.map((sub) => (
                          <li key={sub.label}>
                            <NavLink
                              to={sub.path}
                              className={({ isActive }) =>
                                `block py-2 sm:py-2.5 pl-3 sm:pl-4 pr-2 rounded-lg text-xs sm:text-sm transition-colors ${
                                  isActive
                                    ? 'bg-[#F6B800] text-white font-semibold'
                                    : 'text-white hover:bg-[#F6B800] hover:bg-opacity-90'
                                }`
                              }
                            >
                              {sub.label}
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Logout with bottom spacing */}
      <div className="px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-4">
        <div
          onClick={handleLogout}
          className="flex items-center gap-3 sm:gap-4 text-white cursor-pointer text-sm sm:text-[15px] hover:bg-white/20 p-2 rounded-lg transition-colors"
        >
          <FiLogOut size={20} sm={22} />
          <span>Logout</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
