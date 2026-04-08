import { useState, useEffect } from 'react'
import { getApplicationEmails, getApplicationInteractions, createInteraction } from './api'
import { AddInteraction } from './AddInteraction'

export function CardDetail({ application, isOpen, onClose }) {
  const [emails, setEmails] = useState([])
  const [interactions, setInteractions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('emails')
  const [showAddInteraction, setShowAddInteraction] = useState(false)

  useEffect(() => {
    if (isOpen && application) {
      loadData()
    }
  }, [isOpen, application?.id])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [emailsRes, interactionsRes] = await Promise.all([
        getApplicationEmails(application.id),
        getApplicationInteractions(application.id),
      ])
      setEmails(emailsRes.data || [])
      setInteractions(interactionsRes.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading card detail:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddInteraction = async (data) => {
    try {
      await createInteraction(application.id, data)
      // Refresh interactions
      await loadData()
      setShowAddInteraction(false)
    } catch (err) {
      console.error('Error adding interaction:', err)
      throw err
    }
  }

  if (!isOpen || !application) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Sheet from right */}
      <div
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-background border-l z-50 overflow-y-auto transition-transform duration-300"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground">
                {application.company_name}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {application.job_title}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground p-2"
            >
              ✕
            </button>
          </div>

          {/* Metadata */}
          <div className="mt-4 space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Applied: </span>
              <span className="text-foreground">
                {new Date(application.date_submitted).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Status: </span>
              <span className="text-foreground font-medium">
                {application.status}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b bg-muted/30 sticky top-20 z-40">
          <div className="flex gap-2 px-4">
            {['Emails', 'Interactions', 'Add Note'].map(tab => (
              <button
                key={tab}
                onClick={() => {
                  if (tab === 'Add Note') {
                    setShowAddInteraction(true)
                  } else {
                    setActiveTab(tab.toLowerCase())
                  }
                }}
                className={`py-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.toLowerCase()
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && !emails.length && !interactions.length && (
            <div className="text-center text-muted-foreground py-8">
              Loading...
            </div>
          )}

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded text-sm mb-4">
              {error}
            </div>
          )}

          {/* Emails Tab */}
          {activeTab === 'emails' && (
            <div className="space-y-3">
              {emails.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No emails linked to this application
                </p>
              ) : (
                emails.map(email => (
                  <div
                    key={email.id}
                    className="border rounded p-3 bg-card hover:bg-card/80 transition-colors"
                  >
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
                ))
              )}
            </div>
          )}

          {/* Interactions Tab */}
          {activeTab === 'interactions' && (
            <div className="space-y-3">
              {interactions.length === 0 ? (
                <p className="text-muted-foreground text-sm py-8 text-center">
                  No interactions recorded
                </p>
              ) : (
                interactions.map(interaction => (
                  <div
                    key={interaction.id}
                    className="border-l-2 border-primary pl-3 py-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium text-sm text-foreground capitalize">
                          {interaction.type.replace('_', ' ')}
                        </p>
                        {interaction.content && (
                          <p className="text-sm text-foreground mt-1">
                            {interaction.content}
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(interaction.occurred_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add Interaction Modal */}
        {showAddInteraction && (
          <AddInteraction
            appId={application.id}
            onClose={() => setShowAddInteraction(false)}
            onSubmit={handleAddInteraction}
          />
        )}
      </div>
    </>
  )
}
