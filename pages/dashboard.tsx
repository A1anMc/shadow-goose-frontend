import { useRouter } from 'next/router';
import { getBranding } from '../src/lib/branding';
import RealTimeStatus from '../src/components/RealTimeStatus';
import ExportPanel from '../src/components/ExportPanel';

// Production-ready dashboard with enhanced analytics and UI/UX
// Version: 1.0.1 - Enhanced Dashboard with Analytics
export default function Dashboard() {
  const router = useRouter();
  const branding = getBranding();

  return (
    <div className="min-h-screen bg-sg-background">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-sg-primary">
                {branding.name} Dashboard
              </h1>
              <nav className="flex space-x-4">
                <button
                  onClick={() => router.push('/instant-analytics')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Instant Analytics
                </button>
                <button
                  onClick={() => router.push('/analytics')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Analytics
                </button>
                <button
                  onClick={() => router.push('/impact-analytics')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  Impact Analytics
                </button>
                <button
                  onClick={() => router.push('/projects/new')}
                  className="text-gray-600 hover:text-sg-primary transition-colors"
                >
                  New Project
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, SGE Team
              </span>
              <span className="text-xs text-gray-400">
                v1.0.1 Enhanced
              </span>
              <ExportPanel
                data={{
                  totalProjects: 2,
                  activeProjects: 2,
                  totalParticipants: 529,
                  totalFunding: 275000,
                  averageProgress: 65.4,
                  okrsOnTrack: 1,
                  recentActivity: [
                    { description: 'Youth Employment Initiative progress updated to 68.4%' },
                    { description: 'New OKR created for Digital Literacy program' },
                    { description: 'Grant application submitted for Community Health' },
                  ],
                }}
                dataType="dashboard"
              />
              <button
                onClick={() => router.push('/')}
                className="bg-sg-accent text-white px-4 py-2 rounded-md text-sm hover:bg-sg-accent/90 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Real-time Status */}
        <RealTimeStatus refreshInterval={30} />

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Projects</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">529</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Funding</p>
                <p className="text-2xl font-bold text-gray-900">$275,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <button
            onClick={() => router.push('/instant-analytics')}
            className="p-6 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Instant Analytics</h3>
            <p className="text-sm opacity-90">Real-time insights and live updates</p>
          </button>

          <button
            onClick={() => router.push('/impact-analytics')}
            className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Impact Analytics</h3>
            <p className="text-sm opacity-90">Deep dive into impact measurement</p>
          </button>

          <button
            onClick={() => router.push('/analytics')}
            className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Full Analytics</h3>
            <p className="text-sm opacity-90">Comprehensive analytics dashboard</p>
          </button>

          <button
            onClick={() => router.push('/grants')}
            className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">Grant Management</h3>
            <p className="text-sm opacity-90">Find & apply for grants</p>
          </button>

          <button
            onClick={() => router.push('/okrs')}
            className="p-6 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">OKR Management</h3>
            <p className="text-sm opacity-90">Objectives & Key Results</p>
          </button>

          <button
            onClick={() => router.push('/projects/new')}
            className="p-6 bg-gradient-to-r from-sg-primary to-sg-accent text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            <h3 className="text-lg font-semibold mb-2">New Project</h3>
            <p className="text-sm opacity-90">Create a new SGE initiative</p>
          </button>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Overall Progress</h2>
          <div className="flex items-center">
            <div className="flex-1">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Average Progress</span>
                <span>65.4%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-sg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: '65.4%' }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">SGE Projects</h2>
              <button
                onClick={() => router.push('/projects/new')}
                className="bg-sg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-sg-primary/90 transition-colors"
              >
                Create New Project
              </button>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Youth Employment Initiative</h3>
                  <p className="text-sm text-gray-600 mt-1">Supporting young people in finding meaningful employment opportunities</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                    <span className="text-sm text-gray-500">342 participants</span>
                    <span className="text-sm text-gray-500">$180,000</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Progress</div>
                    <div className="text-lg font-semibold text-gray-900">68.4%</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-sg-accent h-2 rounded-full"
                      style={{ width: '68.4%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 hover:bg-gray-50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Community Health Program</h3>
                  <p className="text-sm text-gray-600 mt-1">Improving health outcomes in underserved communities</p>
                  <div className="flex items-center mt-2 space-x-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                    <span className="text-sm text-gray-500">187 participants</span>
                    <span className="text-sm text-gray-500">$95,000</span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Progress</div>
                    <div className="text-lg font-semibold text-gray-900">62.3%</div>
                  </div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-sg-accent h-2 rounded-full"
                      style={{ width: '62.3%' }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
