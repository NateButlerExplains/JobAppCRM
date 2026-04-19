import { useState, useEffect } from 'react'

const SETTINGS_KEY = 'app_settings'

const defaultSettings = {
  autoArchiveAfterDays: 90,
  followUpThresholdHours: 48,
}

export function Settings() {
  const [settings, setSettings] = useState(defaultSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem(SETTINGS_KEY)
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])


  const handleSave = () => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }


  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      setSettings(defaultSettings)
      localStorage.removeItem(SETTINGS_KEY)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-3xl font-black uppercase text-white" style={{ letterSpacing: '1px' }}>
          Settings
        </h2>
        <p className="text-slate-400 text-sm mt-2">Configure app preferences</p>
      </div>

      {saved && (
        <div className="bg-green-900/30 border border-green-700 text-green-300 p-4 rounded">
          ✓ Settings saved
        </div>
      )}

      {/* Archive & Follow-up Settings */}
      <div className="bg-slate-800/50 border border-slate-700 p-6 space-y-6" style={{ borderRadius: '8px' }}>
        <h3 className="font-bold text-white uppercase text-sm" style={{ letterSpacing: '0.5px' }}>
          📋 Application Preferences
        </h3>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Auto-archive applications after (days): {settings.autoArchiveAfterDays}
          </label>
          <input
            type="range"
            min="30"
            max="365"
            step="15"
            value={settings.autoArchiveAfterDays || 90}
            onChange={(e) => setSettings({...settings, autoArchiveAfterDays: parseInt(e.target.value)})}
            className="w-full"
          />
          <p className="text-xs text-slate-500 mt-2">
            Applications automatically move to archive after this many days with no status change
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-300 mb-2">
            Follow-up nudge appears after (hours): {settings.followUpThresholdHours}
          </label>
          <input
            type="range"
            min="24"
            max="120"
            step="6"
            value={settings.followUpThresholdHours || 48}
            onChange={(e) => setSettings({...settings, followUpThresholdHours: parseInt(e.target.value)})}
            className="w-full"
          />
          <p className="text-xs text-slate-500 mt-2">
            Dashboard cards show ⏰ Follow-up badge after this many hours since applying (if status unchanged)
          </p>
        </div>
      </div>


      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase transition-colors"
          style={{ borderRadius: '4px' }}
        >
          ✓ Save Settings
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold uppercase transition-colors"
          style={{ borderRadius: '4px' }}
        >
          ↻ Reset
        </button>
      </div>
    </div>
  )
}
