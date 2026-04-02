import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link as LinkIcon, LogOut, LayoutDashboard, User } from 'lucide-react';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-lg shadow-primary-600/30">
                <LinkIcon size={18} />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Link<span className="text-primary-400">Snip</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-ghost px-3 py-2 text-sm hidden sm:flex items-center gap-2">
                  <LayoutDashboard size={16} />
                  Dashboard
                </Link>
                <div className="h-8 w-px bg-border hidden sm:block"></div>
                <div className="group relative flex items-center gap-2 cursor-pointer">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-hover border border-border">
                    <User size={18} className="text-zinc-300" />
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{user?.name.split(' ')[0]}</span>
                  
                  {/* Dropdown */}
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-surface p-1 opacity-0 shadow-xl transition-all invisible group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                    <Link to="/dashboard" className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-surface-hover hover:text-white sm:hidden">
                      <LayoutDashboard size={16} /> Dashboard
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full rounded-md px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      <LogOut size={16} />
                      Log out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary px-4 py-2 text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
