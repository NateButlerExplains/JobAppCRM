import { useState } from 'react'

export function AddInteraction({ appId, onClose, onSubmit }) {
  const [type, setType] = useState('manual_note')
  const [content, setContent] = useState('')
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        type,
        content,
        occurred_at: new Date(occurredAt).toISOString(),
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to add interaction')
      console.error('Error submitting interaction:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-background border rounded-lg shadow-lg max-w-sm w-full mx-4 p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Add Interaction
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type Selector */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded bg-background text-foreground"
              >
                <option value="phone_call">Phone Call</option>
                <option value="text_message">Text Message</option>
                <option value="manual_note">Manual Note</option>
              </select>
            </div>

            {/* Datetime Picker */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                When
              </label>
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded bg-background text-foreground"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter details about the interaction..."
                rows={4}
                className="w-full px-3 py-2 border border-input rounded bg-background text-foreground placeholder-muted-foreground"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded text-sm">
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-input rounded text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
