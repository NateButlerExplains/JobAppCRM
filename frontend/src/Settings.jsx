import { useState, useEffect } from 'react'
import { getSyncLogs, runEmailSync } from './api'

export function Settings() {
  const [syncLogs, setSyncLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [error, setError] = useState(null)
  const [syncStatus, setSyncStatus] = useState(null)

  useEffect(() => {
    loadSyncLogs()
  }, [])

  const loadSyncLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getSyncLogs(10)
      setSyncLogs(response.data || [])
    } catch (err) {
      setError(err.message)
      console.error('Error loading sync logs:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRunSync = async () => {
    setSyncing(true)
    setSyncStatus(null)
    setError(null)

    try {
      const response = await runEmailSync()
      setSyncStatus('Sync started successfully')

      // Poll for completion
      let isComplete = false
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max

      while (!isComplete && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

        try {
          const logsResponse = await getSyncLogs(10)
          const latestLog = logsResponse.data?.[0]

          if (latestLog && (latestLog.status === 'completed' || latestLog.status === 'error')) {
            isComplete = true
            if (latestLog.status === 'completed') {
              setSyncStatus(
                `Sync completed: ${latestLog.emails_processed || 0} emails processed, ` +
                `${latestLog.apps_created || 0} apps created`
              )
            } else {
              setError('Sync failed. Please try again.')
            }
            // Reload logs
            setSyncLogs(logsResponse.data || [])
          }
        } catch (err) {
          console.error('Error checking sync status:', err)
        }

        attempts++
      }

      if (!isComplete) {
        setSyncStatus('Sync is still in progress. Please check back shortly.')
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to start sync')
      console.error('Error starting sync:', err)
    } finally {
      setSyncing(false)
    }
  }

  const getLastSyncTime = () => {
    if (syncLogs.length === 0) return 'Never'
    const lastLog = syncLogs[0]
    if (!lastLog.finished_at) return 'In progress...'
    return new Date(lastLog.finished_at).toLocaleString()
  }

  const getDuration = (log) => {
    if (!log.started_at || !log.finished_at) return 'N/A'
    const start = new Date(log.started_at)
    const end = new Date(log.finished_at)
    const seconds = Math.round((end - start) / 1000)
    return `${seconds}s`
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage email sync and view sync history</p>
      </div>

      {/* Last Sync */}
      <div className="bg-card border rounded p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Email Sync</h2>

        <div className="space-y-4">
          {/* Last Sync Time */}
          <div>
            <p className="text-sm text-muted-foreground">Last Sync</p>
            <p className="text-lg font-medium text-foreground mt-1">
              {getLastSyncTime()}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive text-destructive rounded text-sm">
              {error}
            </div>
          )}

          {/* Success Message */}
          {syncStatus && !error && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-900 rounded text-sm">
              ✓ {syncStatus}
            </div>
          )}

          {/* Run Sync Button */}
          <button
            onClick={handleRunSync}
            disabled={syncing || loading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:opacity-90 disabled:opacity-50 transition-opacity font-medium"
          >
            {syncing ? 'Syncing...' : 'Run Sync Now'}
          </button>
        </div>
      </div>

      {/* Sync Logs Table */}
      <div className="bg-card border rounded p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Sync History</h2>

        {loading && syncLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading sync history...
          </div>
        ) : syncLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No sync history yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Duration</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Emails Processed</th>
                  <th className="text-right py-3 px-4 font-semibold text-foreground">Apps Created</th>
                  <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log, idx) => (
                  <tr key={idx} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-foreground">
                      {log.started_at
                        ? new Date(log.started_at).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-foreground">
                      {getDuration(log)}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {log.emails_processed || 0}
                    </td>
                    <td className="py-3 px-4 text-right text-foreground">
                      {log.apps_created || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          log.status === 'completed'
                            ? 'bg-green-50 text-green-700'
                            : log.status === 'running'
                            ? 'bg-blue-50 text-blue-700'
                            : log.status === 'error'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        {log.status || 'unknown'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
