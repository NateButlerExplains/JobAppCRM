export function Settings() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-2">App information and configuration</p>
      </div>

      {/* About */}
      <div className="bg-card border rounded p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">About JobAppCRM</h2>
        <div className="space-y-3 text-sm text-foreground">
          <p>
            A personal job application tracker for managing your job search pipeline.
          </p>
          <p className="text-muted-foreground">
            Create applications, track their status through stages (Submitted, Interview Started, Offered, Denied),
            and log interactions (notes, phone calls, etc.) to stay organized.
          </p>
        </div>
      </div>

      {/* How to Use */}
      <div className="bg-card border rounded p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">How to Use</h2>
        <ul className="space-y-3 text-sm text-foreground">
          <li className="flex gap-3">
            <span className="text-primary font-bold">1</span>
            <span>Click <strong>"+ New Application"</strong> to add a job you've applied for</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">2</span>
            <span>Drag applications between columns to update their status</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">3</span>
            <span>Click an application card to add interactions (notes, calls, follow-ups)</span>
          </li>
          <li className="flex gap-3">
            <span className="text-primary font-bold">4</span>
            <span>Track your progress through the Kanban board</span>
          </li>
        </ul>
      </div>

      {/* Database */}
      <div className="bg-card border rounded p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Data</h2>
        <p className="text-sm text-foreground mb-4">
          All data is stored locally on your computer in <code className="bg-muted px-2 py-1 rounded text-xs">jobs.db</code>
        </p>
        <p className="text-xs text-muted-foreground">
          No external cloud services or analytics. Your data stays with you.
        </p>
      </div>
    </div>
  )
}
