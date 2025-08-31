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
    { name: 'CRM Pipeline', href: '/crm-grants-pipeline', icon: '🎯' },
    { name: 'Demographics', href: '/applicant-demographics', icon: '👥' },
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
    <nav className={`nav ${className}`}>
      <div className="nav-container">
        <div className="nav-content">
          {/* Logo */}
          <Link href="/dashboard" className="nav-logo">
            <div className="nav-logo-icon">S</div>
            <span>{branding.name}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="nav-links">
            <button
              onClick={handleLogout}
              className="btn btn-ghost"
            >
              <span>👤</span>
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="btn btn-ghost md:hidden"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t border-gray-200 md:hidden">
            <div className="p-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block p-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center space-x-3">
                    <span>{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                </Link>
              ))}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-lg text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <span>👤</span>
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
