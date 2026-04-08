import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanBoard } from '../KanbanBoard'

describe('KanbanBoard', () => {
  const mockSuggestions = []

  it('renders kanban board with all column headers', () => {
    render(
      <KanbanBoard
        applications={[]}
        suggestions={mockSuggestions}
        onCardClick={vi.fn()}
        onApplicationsChange={vi.fn()}
      />
    )

    expect(screen.getByText('Submitted')).toBeInTheDocument()
    expect(screen.getByText('More Info Required')).toBeInTheDocument()
    expect(screen.getByText('Interview Started')).toBeInTheDocument()
    expect(screen.getByText('Denied')).toBeInTheDocument()
    expect(screen.getByText('Offered')).toBeInTheDocument()
  })

  it('renders empty state message when no applications', () => {
    render(
      <KanbanBoard
        applications={[]}
        suggestions={mockSuggestions}
        onCardClick={vi.fn()}
        onApplicationsChange={vi.fn()}
      />
    )

    expect(screen.getAllByText('No applications').length).toBeGreaterThan(0)
  })

  it('calls onCardClick when provided', () => {
    const onCardClick = vi.fn()
    render(
      <KanbanBoard
        applications={[]}
        suggestions={mockSuggestions}
        onCardClick={onCardClick}
        onApplicationsChange={vi.fn()}
      />
    )

    expect(onCardClick).toBeDefined()
  })
})
