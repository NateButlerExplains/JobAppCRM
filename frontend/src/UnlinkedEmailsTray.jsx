import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { linkEmail } from './api'

export function UnlinkedEmailsTray({ emails = [], applications = [], onEmailLinked, onError }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(null) // email id that's loading
  const [searchQuery, setSearchQuery] = useState({})
  const [error, setError] = useState(null)

  // Filter and search
  const filteredAppsForEmail = (emailId) => {
    const query = (searchQuery[emailId] || '').toLowerCase()
    if (!query) return applications
    return applications.filter(app =>
      app.company_name.toLowerCase().includes(query) ||
      app.job_title.toLowerCase().includes(query)
    )
  }

  const handleLinkEmail = async (emailId, appId) => {
    setLoading(emailId)
    setError(null)

    try {
      await linkEmail(emailId, appId)
      // Notify parent
      if (onEmailLinked) {
        onEmailLinked(emailId, appId)
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to link email'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
      console.error('Error linking email:', err)
    } finally {
      setLoading(null)
    }
  }

  if (emails.length === 0) {
    return null
  }

  return (
    <div className="border-t bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header with toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Unlinked Emails</h3>
            <Badge variant="outline" className="bg-amber-50 border-amber-200 text-amber-900">
              {emails.length}
            </Badge>
          </div>
          <span className="text-muted-foreground text-sm">
            {isOpen ? '▼' : '▶'}
          </span>
        </button>

        {/* Expanded content */}
        {isOpen && (
          <div className="mt-4 space-y-3">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded text-sm mb-4">
                {error}
              </div>
            )}

            {emails.map(email => (
              <div
                key={email.id}
                className="border rounded p-4 bg-card hover:bg-card/80 transition-colors"
              >
                <div className="mb-3">
                  <p className="font-medium text-sm text-foreground truncate">
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    From: {email.sender}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(email.date_received).toLocaleDateString()}
                  </p>
                </div>

                {/* Assign Dropdown */}
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Search applications..."
                      value={searchQuery[email.id] || ''}
                      onChange={(e) =>
                        setSearchQuery(prev => ({
                          ...prev,
                          [email.id]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-sm border border-input rounded bg-background text-foreground placeholder-muted-foreground"
                    />

                    {/* Dropdown options */}
                    {(searchQuery[email.id] || '') && (
                      <div className="absolute top-full left-0 right-0 mt-1 border border-input rounded bg-background shadow-lg z-10 max-h-40 overflow-y-auto">
                        {filteredAppsForEmail(email.id).length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No matching applications
                          </div>
                        ) : (
                          filteredAppsForEmail(email.id).map(app => (
                            <button
                              key={app.id}
                              onClick={() => {
                                handleLinkEmail(email.id, app.id)
                                setSearchQuery(prev => ({
                                  ...prev,
                                  [email.id]: '',
                                }))
                              }}
                              disabled={loading === email.id}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors disabled:opacity-50"
                            >
                              <p className="font-medium truncate">
                                {app.company_name}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {app.job_title}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {loading === email.id && (
                    <div className="px-3 py-2 flex items-center">
                      <span className="text-sm text-muted-foreground">Linking...</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
