import Head from 'next/head';
import Link from 'next/link';
import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export default function Layout({ children, title = 'SGE Grants System', description = 'Comprehensive grant management and analytics platform' }: LayoutProps) {

  return (
    <ErrorBoundary componentName="Layout" showDetails={process.env.NODE_ENV === 'development'}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Main content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-surface border-t border-border">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-secondary">
                © 2024 SGE Grants System. All rights reserved.
              </div>
              <div className="flex space-x-6">
                <Link href="/monitoring" className="text-sm text-secondary hover:text-primary transition-colors">
                  System Status
                </Link>
                <Link href="/analytics" className="text-sm text-secondary hover:text-primary transition-colors">
                  Analytics
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
