'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [navbarVisible, setNavbarVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if scrolled past a certain point
      setScrolled(currentScrollY > 20);
      
      // Hide/show navbar based on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down & past 100px
        setNavbarVisible(false);
      } else if (currentScrollY < lastScrollY || currentScrollY < 50) {
        // Scrolling up or near top
        setNavbarVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 shadow-lg transition-all duration-300 ease-in-out transform ${
        navbarVisible ? 'translate-y-0' : '-translate-y-full'
      } ${scrolled ? 'backdrop-blur-md' : ''}`}
      style={{ 
        backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : '#FFFFFF',
        borderBottom: scrolled ? '1px solid rgba(75, 192, 200, 0.2)' : 'none'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between transition-all duration-300 ${
          scrolled ? 'h-14' : 'h-16'
        }`}>
          <div className="flex items-center">
            <Link 
              href="/" 
              className={`font-bold transition-all duration-300 hover:scale-105 ${
                scrolled ? 'text-xl' : 'text-2xl'
              }`} 
              style={{ color: '#4BC0C8' }}
            >
              🎓 AezCrib
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className={`flex items-center space-x-2 transition-all duration-300 ${
                  scrolled ? 'text-sm' : 'text-base'
                }`}>
                  <User className={`transition-all duration-300 ${
                    scrolled ? 'h-4 w-4' : 'h-5 w-5'
                  }`} style={{ color: '#5C6B73' }} />
                  <span style={{ color: '#5C6B73' }}>
                    {user?.name} ({user?.role})
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md transition-all duration-300 hover:opacity-80 hover:scale-105 ${
                    scrolled ? 'text-sm' : 'text-base'
                  }`}
                  style={{ color: '#5C6B73', backgroundColor: 'transparent' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#D9F7F4')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <LogOut className={`transition-all duration-300 ${
                    scrolled ? 'h-3 w-3' : 'h-4 w-4'
                  }`} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`px-3 py-2 rounded-md transition-all duration-300 hover:opacity-80 hover:scale-105 ${
                    scrolled ? 'text-sm' : 'text-base'
                  }`}
                  style={{ color: '#5C6B73' }}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className={`px-4 py-2 rounded-md transition-all duration-300 hover:opacity-90 hover:scale-105 hover:shadow-lg ${
                    scrolled ? 'text-sm' : 'text-base'
                  }`}
                  style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                >
                  Register 🚀
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className={`p-2 transition-all duration-300 hover:scale-110 ${
                scrolled ? 'text-sm' : 'text-base'
              }`}
              style={{ color: '#5C6B73' }}
            >
              {mobileMenuOpen ? 
                <X className={`transition-all duration-300 ${scrolled ? 'h-5 w-5' : 'h-6 w-6'}`} /> : 
                <Menu className={`transition-all duration-300 ${scrolled ? 'h-5 w-5' : 'h-6 w-6'}`} />
              }
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden animate-in slide-in-from-top duration-200">
            <div 
              className="px-2 pt-2 pb-3 space-y-1 sm:px-3 backdrop-blur-sm" 
              style={{ backgroundColor: 'rgba(217, 247, 244, 0.95)' }}
            >
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2" style={{ color: '#5C6B73' }}>
                    {user?.name} ({user?.role})
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 w-full text-left px-3 py-2 rounded-md transition-all duration-300 hover:opacity-80 hover:scale-105"
                    style={{ color: '#5C6B73' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md transition-all duration-300 hover:opacity-80 hover:scale-105"
                    style={{ color: '#5C6B73' }}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-md transition-all duration-300 hover:opacity-90 hover:scale-105"
                    style={{ backgroundColor: '#FFD166', color: '#5C6B73' }}
                  >
                    Register 🚀
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}