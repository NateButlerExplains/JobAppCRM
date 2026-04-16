import { useState, useEffect } from 'react'
import { getApplications, getStats, getStageSuggestions } from './api'
import { KanbanBoard } from './KanbanBoard'
import { CardDetail } from './CardDetail'
import { NewApplicationForm } from './NewApplicationForm'
import { Settings } from './Settings'
import './App.css'

function App() {
  const [applications, setApplications] = useState([])
  const [stats, setStats] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [showCardDetail, setShowCardDetail] = useState(false)
  const [showNewAppForm, setShowNewAppForm] = useState(false)
  const [currentPage, setCurrentPage] = useState('dashboard')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [appsRes, statsRes, suggestionsRes] = await Promise.all([
        getApplications(),
        getStats(),
        getStageSuggestions(),
      ])

      setApplications(appsRes.data)
      setStats(statsRes.data)
      setSuggestions(suggestionsRes.data)
    } catch (err) {
      setError(err.message)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCardClick = (app) => {
    setSelectedApp(app)
    setShowCardDetail(true)
  }

  const handleApplicationsChange = (updatedApps) => {
    setApplications(updatedApps)
  }

  if (loading && currentPage === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-slate-400">Loading Job CRM...</p>
        </div>
      </div>
    )
  }

  if (error && currentPage === 'dashboard') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center">
          <p className="text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={loadData}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold uppercase tracking-wide transition-colors"
            style={{ borderRadius: '0px' }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="w-full px-8 py-8">
          <div className="flex justify-between items-center gap-8 mb-4">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tight text-white" style={{ letterSpacing: '2px' }}>
                Job CRM
              </h1>
            </div>
            {currentPage === 'dashboard' && (
              <button
                onClick={() => setShowNewAppForm(true)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs transition-colors border-0"
                style={{ letterSpacing: '0.5px', borderRadius: '0px' }}
              >
                + New Application
              </button>
            )}
          </div>

          {/* Navigation */}
          <div className="flex gap-6 border-t border-slate-800 pt-3">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`font-bold uppercase text-xs tracking-widest transition-colors pb-3 border-b-2 ${
                currentPage === 'dashboard'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
              style={{ letterSpacing: '0.5px' }}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentPage('settings')}
              className={`font-bold uppercase text-xs tracking-widest transition-colors pb-3 border-b-2 ${
                currentPage === 'settings'
                  ? 'text-blue-400 border-blue-400'
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
              style={{ letterSpacing: '0.5px' }}
            >
              Settings
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <div className="flex-1 w-full px-8 py-8">
          {currentPage === 'settings' && <Settings />}
          {currentPage === 'dashboard' && (
            <>
              {/* Stats Bar */}
              <div className="grid grid-cols-5 gap-6 mb-10 border-b border-slate-800 pb-8">
                {[
                  { label: 'Submitted', value: stats.Submitted || 0 },
                  { label: 'More Info', value: stats['More Info Required'] || 0 },
                  { label: 'Interview', value: stats['Interview Started'] || 0 },
                  { label: 'Denied', value: stats.Denied || 0 },
                  { label: 'Offered', value: stats.Offered || 0 },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className="text-4xl font-black text-white mb-2">{stat.value}</div>
                    <div className="text-slate-400 text-xs font-bold uppercase tracking-widest" style={{ letterSpacing: '0.5px' }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Kanban Board */}
              <div className="mb-8">
                <KanbanBoard
                  applications={applications}
                  suggestions={suggestions}
                  onCardClick={handleCardClick}
                  onApplicationsChange={handleApplicationsChange}
                />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <h2 className="font-bold text-white mb-4 uppercase tracking-wide">Stage Suggestions ({suggestions.length})</h2>
                  <div className="text-slate-400">
                    <p>Pending suggestions component</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Card Detail Panel */}
      <CardDetail
        application={selectedApp}
        isOpen={showCardDetail}
        onClose={() => {
          setShowCardDetail(false)
          setSelectedApp(null)
        }}
      />

      {/* New Application Form Modal */}
      <NewApplicationForm
        isOpen={showNewAppForm}
        onClose={() => setShowNewAppForm(false)}
        onSuccess={(newApp) => {
          setApplications(prev => [newApp, ...prev])
          loadData()
        }}
      />
    </div>
  )
}

export default App
