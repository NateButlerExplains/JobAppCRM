import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import axios from 'axios'
import { Settings } from '../Settings'

vi.mock('axios')

describe('Settings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    axios.get.mockResolvedValue({ data: { authenticated: true } })
    axios.post.mockResolvedValue({ data: {} })
  })

  it('renders settings page with title', () => {
    render(<Settings />)

    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('renders all major sections', () => {
    render(<Settings />)

    expect(screen.getByText('Outlook Connection')).toBeInTheDocument()
    expect(screen.getByText('Email Sync')).toBeInTheDocument()
    expect(screen.getByText('Sync History')).toBeInTheDocument()
    expect(screen.getByText('Gemini Health')).toBeInTheDocument()
  })

  it('checks auth status on mount', async () => {
    render(<Settings />)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith('/api/auth/status')
    })
  })

  it('displays connected status when authenticated', async () => {
    axios.get.mockResolvedValueOnce({ data: { authenticated: true } })

    render(<Settings />)

    await waitFor(() => {
      const connected = screen.queryByText(/connected/i)
      expect(connected).toBeInTheDocument()
    })
  })

  it('displays not connected status when not authenticated', async () => {
    axios.get.mockClear()
    axios.get.mockResolvedValueOnce({ data: { authenticated: false } })
    axios.get.mockResolvedValueOnce({ data: [] }) // sync logs
    axios.post.mockResolvedValueOnce({ data: { ok: false } }) // gemini health

    render(<Settings />)

    await waitFor(() => {
      const notConnected = screen.queryByText(/not connected/i)
      expect(notConnected).toBeInTheDocument()
    }, { timeout: 5000 })
  })

  it('handles API errors gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))

    render(<Settings />)

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalled()
    })
    // Should not crash
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })
})
