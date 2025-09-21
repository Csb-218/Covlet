import { useState, ReactNode } from 'react';
import { useLocation, NavLink } from "react-router-dom"

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const location = useLocation();
  
  // console.log('Current location:', location.pathname);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <div className="h-full flex flex-col">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-4 py-3 flex-shrink-0 relative z-50">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/30 via-transparent to-teal-50/30 animate-gradient-x"></div>
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Covlet
            </h1>
          </div>
          
          {/* Burger Menu Button */}
          <div className="relative">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            
            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div 
                className="absolute right-0 top-12 w-48 bg-white backdrop-blur-md border border-gray-200/50 rounded-lg shadow-xl z-[9999]"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <div className="py-2">
                  <NavLink
                    to={"/"}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling to overlay
                      closeMenu();
                    }}
                    className={({ isActive }) =>
                      `block px-4 py-2 text-sm transition-colors ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                      Home
                    </div>
                  </NavLink>
                  
                  <NavLink
                    to={"/profile"}
                    data-testid="profile-navlink"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent event from bubbling to overlay
                      closeMenu();
                    }}
                    className={({ isActive }) => {
                      // console.log('Profile NavLink rendering, isActive:', isActive);
                      return `block px-4 py-2 text-sm transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`;
                    }}
                  >
                    <div className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile
                    </div>
                  </NavLink>

                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="bg-transparent flex-1 overflow-hidden">
        <section className="h-full overflow-y-auto">
          {children}
        </section>
      </div>
      
      {/* Overlay to close menu when clicking outside */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-[1]"
          onClick={(e) => {
            // Only close if clicking directly on the overlay, not on dropdown content
            if (e.target === e.currentTarget) {
              closeMenu();
            }
          }}
        />
      )}
    </div>
  );
};

export default Layout;
