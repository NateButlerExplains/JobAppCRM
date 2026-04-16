import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

export function ApplicationCard({ application, hasSuggestion, onClick, onDelete, isArchived }) {
  const hasPendingSuggestion = hasSuggestion === true

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(application.id)
    }
  }

  return (
    <Card
      onClick={onClick}
      className="p-4 bg-card hover:bg-card/80 hover:shadow-md transition-all cursor-pointer border group relative"
    >
      {/* Delete button - visible on hover */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-destructive/20 rounded"
          title={isArchived ? 'Permanently delete' : 'Move to trash'}
        >
          <Trash2 className="w-4 h-4 text-destructive" />
        </button>
      )}

      <div className="space-y-2">
        {/* Company Name */}
        <h3 className="font-semibold text-foreground truncate">
          {application.company_name}
        </h3>

        {/* Job Title */}
        <p className="text-sm text-muted-foreground truncate">
          {application.job_title}
        </p>

        {/* Date Applied */}
        <p className="text-xs text-muted-foreground">
          Applied: {new Date(application.date_submitted).toLocaleDateString()}
        </p>

        {/* Pending Suggestion Badge */}
        {hasPendingSuggestion && (
          <div className="pt-1">
            <Badge variant="default" className="bg-amber-600 hover:bg-amber-700">
              Suggestion Pending
            </Badge>
          </div>
        )}
      </div>
    </Card>
  )
}
