import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { getNonJobRelatedEmails, reclassifyEmails } from './api'

export function UnrelatedEmails({ onError }) {
  const [isOpen, setIsOpen] = useState(false)
  const [emails, setEmails] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [reclassifying, setReclassifying] = useState(false)
  const [reclassifyResult, setReclassifyResult] = useState(null)

  // Load non-job-related emails when component mounts
  useEffect(() => {
    loadEmails()
  }, [])

  const loadEmails = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getNonJobRelatedEmails()
      setEmails(response.data || [])
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to load unrelated emails'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
      console.error('Error loading unrelated emails:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReclassify = async (limit = 20) => {
    setReclassifying(true)
    setError(null)
    setReclassifyResult(null)

    try {
      const response = await reclassifyEmails('unrelated', limit)
      const result = response.data
      setReclassifyResult(result)

      // Reload emails to reflect changes
      await loadEmails()
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to reclassify emails'
      setError(errorMsg)
      if (onError) {
        onError(errorMsg)
      }
      console.error('Error reclassifying emails:', err)
    } finally {
      setReclassifying(false)
    }
  }

  return (
    <div className="border-t bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Header with toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between py-2 hover:opacity-80 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Unrelated Emails</h3>
            <Badge variant="outline" className="bg-gray-100 border-gray-300 text-gray-900">
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
            {/* Reclassify buttons */}
            <div className="flex gap-2 pb-4 border-b">
              <button
                onClick={() => handleReclassify(20)}
                disabled={reclassifying || emails.length === 0}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {reclassifying ? 'Reclassifying...' : 'Reclassify (20)'}
              </button>
              <button
                onClick={() => handleReclassify(null)}
                disabled={reclassifying || emails.length === 0}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {reclassifying ? 'Reclassifying...' : 'Reclassify All'}
              </button>
            </div>

            {/* Reclassification results */}
            {reclassifyResult && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
                <p className="font-medium mb-1">{reclassifyResult.message}</p>
                <ul className="text-xs space-y-1 ml-2">
                  <li>✅ Reclassified: {reclassifyResult.reclassified}</li>
                  <li>📝 As Confirmations: {reclassifyResult.application_confirmations}</li>
                  <li>💼 As Job Leads: {reclassifyResult.moved_to_leads}</li>
                  <li>📧 Still Unrelated: {reclassifyResult.still_unrelated}</li>
                  {reclassifyResult.errors && reclassifyResult.errors.length > 0 && (
                    <li className="text-red-600">⚠️ Errors: {reclassifyResult.errors.length}</li>
                  )}
                </ul>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-900 rounded text-sm mb-4">
                {error}
              </div>
            )}

            {loading && (
              <div className="p-4 text-center text-muted-foreground">
                Loading emails...
              </div>
            )}

            {!loading && emails.map(email => (
              <div
                key={email.id}
                className="border rounded p-4 bg-white hover:bg-gray-50 transition-colors"
              >
                <div className="mb-2">
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

                {/* Email body preview */}
                {email.body_excerpt && (
                  <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-muted-foreground max-h-20 overflow-y-auto">
                    {email.body_excerpt.substring(0, 200)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
