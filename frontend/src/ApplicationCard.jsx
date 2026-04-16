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
    <div
      onClick={onClick}
      className="p-6 bg-white border border-gray-200 hover:border-black cursor-pointer group relative transition-colors duration-200"
      style={{ borderRadius: '0px' }}
    >
      {/* Delete button - visible on hover */}
      {onDelete && (
        <button
          onClick={handleDelete}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:text-red-600"
          title={isArchived ? 'Permanently delete' : 'Move to trash'}
        >
          <Trash2 className="w-5 h-5 text-gray-400 hover:text-red-600" />
        </button>
      )}

      <div className="space-y-4">
        {/* Company Name */}
        <h3 className="font-black text-lg leading-tight text-black truncate" style={{ letterSpacing: '0.5px' }}>
          {application.company_name}
        </h3>

        {/* Job Title */}
        <p className="text-sm text-gray-700 truncate font-medium">
          {application.job_title}
        </p>

        {/* Date Applied */}
        <p className="text-xs text-gray-500 font-medium">
          {new Date(application.date_submitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>

        {/* Pending Suggestion Badge */}
        {hasPendingSuggestion && (
          <div className="pt-2">
            <Badge className="bg-yellow-300 text-black border-0 font-bold uppercase text-xs" style={{ borderRadius: '4px', letterSpacing: '0.5px' }}>
              ⚡ Suggestion
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}
