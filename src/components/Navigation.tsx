import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { authService } from '../lib/auth';
import { getBranding } from '../lib/branding';

interface NavigationProps {
  className?: string;
}

export default function Navigation({ className = '' }: NavigationProps) {
  const router = useRouter();
  const branding = getBranding();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Grants', href: '/grants', icon: '💰' },
    { name: 'Analytics', href: '/analytics', icon: '📈' },
    { name: 'Projects', href: '/projects', icon: '📋' },
    { name: 'Relationships', href: '/relationships', icon: '🤝' },
    { name: 'OKRs', href: '/okrs', icon: '🎯' },
    { name: 'Monitoring', href: '/monitoring', icon: '🔍' },
  ];

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  return (
    <nav className={`bg-surface border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-semibold text-primary">{branding.name}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.href)
                    ? 'bg-accent text-white shadow-md'
                    : 'text-secondary hover:text-primary hover:bg-surface-hover'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="btn btn-ghost text-sm"
            >
              <span>👤</span>
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="btn btn-ghost p-2"
            >
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 flex items-center space-x-3 ${
                    isActive(item.href)
                      ? 'bg-accent text-white'
                      : 'text-secondary hover:text-primary hover:bg-surface-hover'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              <div className="border-t border-border pt-2 mt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-secondary hover:text-primary hover:bg-surface-hover flex items-center space-x-3"
                >
                  <span>👤</span>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
