import React from 'react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Layout from '../src/components/Layout';
import MonitoringDashboard from '../src/components/MonitoringDashboard';
import { authService } from '../src/lib/auth';

export default function MonitoringPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push("/login");
      return;
    }
    setUser(currentUser);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>System Monitoring - Grant Management System</title>
        <meta name="description" content="Real-time system monitoring and health checks" />
      </Head>
      
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitoring</h1>
            <p className="text-gray-600">
              Real-time monitoring of system health, performance metrics, and alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Monitoring Dashboard */}
            <div className="lg:col-span-2">
              <MonitoringDashboard 
                refreshInterval={30000} // 30 seconds
                showAlerts={true}
                showPerformance={true}
              />
            </div>

            {/* Quick Stats Sidebar */}
            <div className="space-y-6">
              {/* System Info */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Environment:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {process.env.NODE_ENV || 'development'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Version:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {process.env.npm_package_version || '1.0.0'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Platform:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {typeof window !== 'undefined' ? 'Browser' : 'Server'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => window.open('/api/health', '_blank')}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    View Health API
                  </button>
                  <button
                    onClick={() => window.open('/api/status', '_blank')}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    View Status API
                  </button>
                  <button
                    onClick={() => router.push('/analytics')}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Monitoring Tips */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Monitoring Tips</h3>
                <div className="space-y-2 text-sm text-blue-800">
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Health checks run every 30 seconds automatically</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Performance alerts trigger at 5% error rate</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Response time warnings at 2+ seconds</span>
                  </div>
                  <div className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Memory alerts at 80%+ usage</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
