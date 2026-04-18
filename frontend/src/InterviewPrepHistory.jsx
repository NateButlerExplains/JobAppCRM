import { useState, useEffect } from 'react'
import { getInterviewPrepHistory } from './api'

export function InterviewPrepHistory({ onSelectApp }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadSessions = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await getInterviewPrepHistory()
        setSessions(res.data || [])
      } catch (err) {
        setError(err.message || 'Failed to load interview prep history')
        setSessions([])
      } finally {
        setLoading(false)
      }
    }
    loadSessions()
  }, [])

  const handleSessionClick = (session) => {
    if (onSelectApp) {
      onSelectApp({
        id: session.application_id,
        company_name: session.company_name,
        job_title: session.job_title,
      })
    }
  }

  const hasResearch = (session) => {
    return session.company_research && (
      typeof session.company_research === 'string'
        ? JSON.parse(session.company_research).company_overview
        : session.company_research.company_overview
    )
  }

  const hasQuestions = (session) => {
    return session.interview_questions && (
      typeof session.interview_questions === 'string'
        ? JSON.parse(session.interview_questions).length > 0
        : Array.isArray(session.interview_questions) && session.interview_questions.length > 0
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-black uppercase text-white mb-4" style={{ letterSpacing: '1px' }}>
          Interview Prep
        </h2>
        <p className="text-slate-400 text-sm">View and manage all saved interview preparation sessions</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 p-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="bg-slate-800/30 border border-slate-700 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="text-slate-400 mt-4">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700 p-8 text-center">
          <p className="text-slate-400">No interview prep sessions yet. Upload company research or use the research tool to get started.</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => handleSessionClick(session)}
              className="p-4 bg-slate-800 border border-slate-700 hover:border-blue-500 cursor-pointer transition-all duration-200 hover:bg-slate-750 flex-shrink-0"
              style={{ borderRadius: '8px', width: '280px' }}
            >
              <div className="space-y-3">
                <div>
                  <h3 className="font-bold text-base text-white">
                    {session.company_name}
                  </h3>
                  <p className="text-sm text-blue-400 font-semibold">
                    {session.job_title}
                  </p>
                </div>

                {/* Status badges */}
                <div className="flex gap-2 flex-wrap">
                  {hasResearch(session) && (
                    <span className="inline-block px-2 py-1 bg-green-600/40 text-green-300 text-xs font-bold" style={{ borderRadius: '4px' }}>
                      ✓ Research
                    </span>
                  )}
                  {hasQuestions(session) && (
                    <span className="inline-block px-2 py-1 bg-blue-600/40 text-blue-300 text-xs font-bold" style={{ borderRadius: '4px' }}>
                      ✓ Questions
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
