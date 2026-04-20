'use client'

import { useEffect, useMemo, useState } from 'react'

type RecommendationModel = {
  name?: string
  msrp?: number
  why?: string
}

type RecommendationInsight = {
  title?: string
  text?: string
}

type Recommendation = {
  intro?: string
  verdict?: string
  closing?: string
  models?: RecommendationModel[]
  insights?: RecommendationInsight[]
}

type Advice = {
  id: string
  lead_id: string
  recommendation?: Recommendation | null
  created_at?: string | null
}

type LeadHistoryItem = {
  id: string
  created_at?: string | null
}

type Lead = {
  id: string
  name?: string | null
  email?: string | null
  phone?: string | null
  budget?: string | null
  budget_type?: string | null
  message?: string | null
  source?: string | null
  status?: string | null
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
  advice?: Advice[]
  history?: LeadHistoryItem[]
}

type StatusFilter = 'all' | 'just_in' | 'working_on_it' | 'all_done'
type AdminRole = 'super_admin' | 'notes_only' | null

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isLoadingLeadDetail, setIsLoadingLeadDetail] = useState(false)
  const [notesDraft, setNotesDraft] = useState('')
  const [isSavingNotes, setIsSavingNotes] = useState(false)
  const [adminRole, setAdminRole] = useState<AdminRole>(null)

  const [statusChecks, setStatusChecks] = useState({
    just_in: true,
    working_on_it: true,
    all_done: true,
  })

  const fetchLeads = async (search: string, status: StatusFilter) => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams()

      if (search.trim()) {
        params.set('q', search.trim())
      }

      if (status !== 'all') {
        params.set('status', status)
      }

      const res = await fetch(`/api/admin/leads?${params.toString()}`, {
        cache: 'no-store',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to load leads')
      }

      const data = await res.json()
      const sortedLeads = (data.leads || []).sort((a: Lead, b: Lead) => {
        const priority: Record<string, number> = {
          just_in: 0,
          working_on_it: 1,
          all_done: 2,
        }

        return (priority[a.status || ''] ?? 99) - (priority[b.status || ''] ?? 99)
      })

      console.log('LEADS FROM API', data.leads)

      setLeads(sortedLeads)

      if (data.adminRole) {
        setAdminRole(data.adminRole)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads(q, statusFilter)
  }, [q, statusFilter])

  const visibleLeads = useMemo(() => {
    return leads.filter((lead) => {
      const status = lead.status || 'just_in'

      if (status === 'just_in') return statusChecks.just_in
      if (status === 'working_on_it') return statusChecks.working_on_it
      if (status === 'all_done') return statusChecks.all_done

      return statusChecks.just_in
    })
  }, [leads, statusChecks])

  const justInCount = useMemo(
    () => leads.filter((lead) => lead.status === 'just_in').length,
    [leads]
  )

  const workingOnItCount = useMemo(
    () => leads.filter((lead) => lead.status === 'working_on_it').length,
    [leads]
  )

  const allDoneCount = useMemo(
    () => leads.filter((lead) => lead.status === 'all_done').length,
    [leads]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setQ(searchInput)
  }

  const handleClear = () => {
    setSearchInput('')
    setQ('')
    setStatusFilter('all')
    setStatusChecks({
      just_in: true,
      working_on_it: true,
      all_done: true,
    })
  }

  const handleOpenLead = async (leadId: string) => {
    setIsLoadingLeadDetail(true)

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        cache: 'no-store',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to load lead details')
      }

      const data = await res.json()
      const fullLead = {
        ...data.lead,
        history: data.history || [],
      } as Lead

      setSelectedLead(fullLead)
      setNotesDraft(fullLead.notes || '')

      if (data.adminRole) {
        setAdminRole(data.adminRole)
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to load lead details')
    } finally {
      setIsLoadingLeadDetail(false)
    }
  }

  const handleStatusUpdate = async (
    leadId: string,
    newStatus: 'just_in' | 'working_on_it' | 'all_done'
  ) => {
    setIsUpdatingStatus(true)

    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to update status')
      }

      const data = await res.json()
      const updatedLead = {
        ...data.lead,
        history: data.history || [],
      } as Lead

      setSelectedLead(updatedLead)
      setNotesDraft(updatedLead.notes || '')

      if (data.adminRole) {
        setAdminRole(data.adminRole)
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === updatedLead.id
            ? {
                ...lead,
                status: updatedLead.status,
                notes: updatedLead.notes,
                updated_at: updatedLead.updated_at,
              }
            : lead
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      await fetchLeads(q, statusFilter)
      setIsUpdatingStatus(false)
    }
  }

  const handleSaveNotes = async () => {
    if (!selectedLead) return

    setIsSavingNotes(true)

    try {
      const res = await fetch(`/api/admin/leads/${selectedLead.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: notesDraft }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.error || 'Failed to save notes')
      }

      const data = await res.json()
      const updatedLead = {
        ...data.lead,
        history: data.history || [],
      } as Lead

      setSelectedLead(updatedLead)
      setNotesDraft(updatedLead.notes || '')

      if (data.adminRole) {
        setAdminRole(data.adminRole)
      }

      setLeads((current) =>
        current.map((lead) =>
          lead.id === updatedLead.id
            ? {
                ...lead,
                notes: updatedLead.notes,
                status: updatedLead.status,
              }
            : lead
        )
      )
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to save notes')
    } finally {
      setIsSavingNotes(false)
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ marginTop: 0 }}>Admin Dashboard</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <span>Total: {visibleLeads.length}</span>
        <span>Just in: {justInCount}</span>
        <span>We’re working on it: {workingOnItCount}</span>
        <span>All done: {allDoneCount}</span>
        {adminRole ? <span>Access: {adminRole}</span> : null}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          gap: '0.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email"
          style={{
            padding: '0.65rem 0.75rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            minWidth: '280px',
          }}
        />

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#fff',
          }}
        >
          <input
            type="checkbox"
            checked={statusChecks.just_in}
            onChange={(e) =>
              setStatusChecks((current) => ({
                ...current,
                just_in: e.target.checked,
              }))
            }
          />
          Just in
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#fff',
          }}
        >
          <input
            type="checkbox"
            checked={statusChecks.working_on_it}
            onChange={(e) =>
              setStatusChecks((current) => ({
                ...current,
                working_on_it: e.target.checked,
              }))
            }
          />
          We’re working on it
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: '#fff',
          }}
        >
          <input
            type="checkbox"
            checked={statusChecks.all_done}
            onChange={(e) =>
              setStatusChecks((current) => ({
                ...current,
                all_done: e.target.checked,
              }))
            }
          />
          All done
        </label>

        <button
          type="submit"
          style={{
            padding: '0.65rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            background: '#fff',
            color: '#000',
            cursor: 'pointer',
          }}
        >
          Search
        </button>

        <button
          type="button"
          onClick={handleClear}
          style={{
            padding: '0.65rem 1rem',
            border: '1px solid #ccc',
            borderRadius: '6px',
            background: '#fff',
            color: '#000',
            cursor: 'pointer',
          }}
        >
          Clear
        </button>
      </form>

      {loading ? <p>Loading leads...</p> : null}
      {error ? <p style={{ color: 'tomato' }}>{error}</p> : null}
      {isLoadingLeadDetail ? <p>Loading lead detail...</p> : null}

      {!loading && !error && (
        <div
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1.5fr',
              gap: '1rem',
              padding: '0.9rem 1rem',
              background: '#111',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            <div>Name</div>
            <div>Email</div>
            <div>Status</div>
            <div>Created</div>
            <div>Updated</div>
          </div>

          {visibleLeads.length === 0 ? (
            <div style={{ padding: '1rem' }}>No leads found.</div>
          ) : (
            visibleLeads.map((lead) => (
              <button
                key={lead.id}
                type="button"
                onClick={() => handleOpenLead(lead.id)}
                style={{
                  width: '100%',
                  display: 'grid',
                  gridTemplateColumns: '2fr 2fr 1fr 1.5fr 1.5fr',
                  gap: '1rem',
                  padding: '1rem',
                  border: 'none',
                  borderTop: '1px solid #ddd',
                  borderLeft: `4px solid ${
                    lead.status === 'all_done'
                      ? '#16a34a'
                      : lead.status === 'working_on_it'
                      ? '#f59e0b'
                      : '#1f6feb'
                  }`,
                  background:
                    lead.status === 'just_in'
                      ? '#050d1a'
                      : '#000',
                  color: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease',
                }}
              >
                <div>{lead.name || 'Unnamed lead'}</div>
                <div>{lead.email || '-'}</div>
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '999px',
                      background:
                        lead.status === 'all_done'
                          ? '#16a34a'
                          : lead.status === 'working_on_it'
                          ? '#f59e0b'
                          : '#1f6feb',
                      color: '#fff',
                      fontSize: '0.85rem',
                    }}
                  >
                    {lead.status === 'just_in'
                      ? 'Just in'
                      : lead.status === 'working_on_it'
                      ? 'We’re working on it'
                      : lead.status === 'all_done'
                      ? 'All done'
                      : 'Just in'}
                  </span>
                </div>
                <div>
                  {lead.created_at ? new Date(lead.created_at).toLocaleString() : '-'}
                </div>
                <div>
                  {lead.updated_at ? new Date(lead.updated_at).toLocaleString() : '-'}
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {selectedLead && (
        <div
          onClick={() => setSelectedLead(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '900px',
              maxHeight: '90vh',
              overflowY: 'auto',
              background: '#fff',
              color: '#000',
              borderRadius: '12px',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'start',
                gap: '1rem',
              }}
            >
              <div>
                <h2 style={{ marginTop: 0, marginBottom: '0.5rem' }}>
                  {selectedLead.name || 'Unnamed lead'}
                </h2>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Email:</strong> {selectedLead.email || '-'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Phone:</strong> {selectedLead.phone || '-'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Budget:</strong> {selectedLead.budget || '-'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Budget type:</strong> {selectedLead.budget_type || '-'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Source:</strong> {selectedLead.source || '-'}
                </p>
                <p style={{ margin: '0.25rem 0' }}>
                  <strong>Created:</strong>{' '}
                  {selectedLead.created_at
                    ? new Date(selectedLead.created_at).toLocaleString()
                    : '-'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{
                  border: '1px solid #ccc',
                  background: '#fff',
                  color: '#000',
                  borderRadius: '6px',
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>

            {adminRole === 'super_admin' ? (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              >
                <strong>Status</strong>
                <div
                  style={{
                    display: 'flex',
                    gap: '0.75rem',
                    marginTop: '0.75rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    type="button"
                    disabled={isUpdatingStatus || selectedLead.status === 'just_in'}
                    onClick={() => handleStatusUpdate(selectedLead.id, 'just_in')}
                    style={{
                      padding: '0.65rem 1rem',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      background: '#fff',
                      color: '#000',
                      cursor: 'pointer',
                      opacity:
                        isUpdatingStatus || selectedLead.status === 'just_in' ? 0.6 : 1,
                    }}
                  >
                    Just in
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus || selectedLead.status === 'working_on_it'}
                    onClick={() => handleStatusUpdate(selectedLead.id, 'working_on_it')}
                    style={{
                      padding: '0.65rem 1rem',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      background: '#fff',
                      color: '#000',
                      cursor: 'pointer',
                      opacity:
                        isUpdatingStatus || selectedLead.status === 'working_on_it'
                          ? 0.6
                          : 1,
                    }}
                  >
                    We’re working on it
                  </button>

                  <button
                    type="button"
                    disabled={isUpdatingStatus || selectedLead.status === 'all_done'}
                    onClick={() => handleStatusUpdate(selectedLead.id, 'all_done')}
                    style={{
                      padding: '0.65rem 1rem',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      background: '#fff',
                      color: '#000',
                      cursor: 'pointer',
                      opacity:
                        isUpdatingStatus || selectedLead.status === 'all_done' ? 0.6 : 1,
                    }}
                  >
                    All done
                  </button>

                  <span style={{ alignSelf: 'center' }}>
                    Current:{' '}
                    <strong>
                      {selectedLead.status === 'just_in'
                        ? 'Just in'
                        : selectedLead.status === 'working_on_it'
                        ? 'We’re working on it'
                        : selectedLead.status === 'all_done'
                        ? 'All done'
                        : 'Just in'}
                    </strong>
                  </span>
                </div>
              </div>
            ) : (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              >
                <strong>Status</strong>
                <p style={{ marginTop: '0.75rem', marginBottom: 0 }}>
                  {selectedLead.status === 'just_in'
                    ? 'Just in'
                    : selectedLead.status === 'working_on_it'
                    ? 'We’re working on it'
                    : selectedLead.status === 'all_done'
                    ? 'All done'
                    : 'Just in'}
                </p>
              </div>
            )}

            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <strong>Message</strong>
              <p style={{ marginTop: '0.5rem', marginBottom: 0 }}>
                {selectedLead.message || '-'}
              </p>
            </div>

            <div
              style={{
                marginTop: '1rem',
                padding: '1rem',
                border: '1px solid #ddd',
                borderRadius: '8px',
              }}
            >
              <strong>Internal Notes</strong>

              <textarea
                value={notesDraft}
                onChange={(e) => setNotesDraft(e.target.value)}
                rows={6}
                placeholder="Add internal notes here..."
                style={{
                  width: '100%',
                  marginTop: '0.75rem',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                  resize: 'vertical',
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '0.95rem',
                  boxSizing: 'border-box',
                  lineHeight: '1.5',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                }}
              />

              <div style={{ marginTop: '0.75rem' }}>
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                  style={{
                    padding: '0.65rem 1rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    background: '#fff',
                    color: '#000',
                    cursor: 'pointer',
                    opacity: isSavingNotes ? 0.6 : 1,
                  }}
                >
                  {isSavingNotes ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>

            {selectedLead.history && selectedLead.history.length > 1 && (
              <div
                style={{
                  marginTop: '1rem',
                  padding: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                }}
              >
                <strong>Previous Submissions</strong>

                <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.4rem' }}>
                  {selectedLead.history.slice(1).map((item) => (
                    <div key={item.id} style={{ fontSize: '0.9rem' }}>
                      {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginTop: '1rem' }}>
              <strong>Advice</strong>

              {!selectedLead.advice || selectedLead.advice.length === 0 ? (
                <p style={{ marginTop: '0.5rem' }}>No advice yet</p>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.75rem' }}>
                  {selectedLead.advice.map((item) => {
                    const rec = item.recommendation

                    return (
                      <div
                        key={item.id}
                        style={{
                          background: '#f8f8f8',
                          borderRadius: '8px',
                          padding: '1rem',
                          border: '1px solid #ddd',
                        }}
                      >
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                          <strong>Advice ID:</strong> {item.id}
                        </p>

                        {!rec ? (
                          <p style={{ margin: 0 }}>No recommendation data</p>
                        ) : (
                          <div style={{ display: 'grid', gap: '0.75rem' }}>
                            {rec.intro && (
                              <div>
                                <strong>Intro</strong>
                                <p style={{ margin: '0.25rem 0 0 0' }}>{rec.intro}</p>
                              </div>
                            )}

                            {rec.verdict && (
                              <div>
                                <strong>Verdict</strong>
                                <p style={{ margin: '0.25rem 0 0 0' }}>{rec.verdict}</p>
                              </div>
                            )}

                            {rec.models && rec.models.length > 0 && (
                              <div>
                                <strong>Models</strong>
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: '0.5rem',
                                    marginTop: '0.5rem',
                                  }}
                                >
                                  {rec.models.map((model, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        background: '#fff',
                                        borderRadius: '6px',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                      }}
                                    >
                                      <p style={{ margin: 0 }}>
                                        <strong>Name:</strong> {model.name || '-'}
                                      </p>
                                      <p style={{ margin: '0.25rem 0 0 0' }}>
                                        <strong>MSRP:</strong>{' '}
                                        {typeof model.msrp === 'number'
                                          ? `R${model.msrp.toLocaleString()}`
                                          : '-'}
                                      </p>
                                      <p style={{ margin: '0.25rem 0 0 0' }}>
                                        <strong>Why:</strong> {model.why || '-'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rec.insights && rec.insights.length > 0 && (
                              <div>
                                <strong>Insights</strong>
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: '0.5rem',
                                    marginTop: '0.5rem',
                                  }}
                                >
                                  {rec.insights.map((insight, index) => (
                                    <div
                                      key={index}
                                      style={{
                                        background: '#fff',
                                        borderRadius: '6px',
                                        padding: '0.75rem',
                                        border: '1px solid #ddd',
                                      }}
                                    >
                                      <p style={{ margin: 0 }}>
                                        <strong>{insight.title || 'Insight'}</strong>
                                      </p>
                                      <p style={{ margin: '0.25rem 0 0 0' }}>
                                        {insight.text || '-'}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {rec.closing && (
                              <div>
                                <strong>Closing</strong>
                                <p style={{ margin: '0.25rem 0 0 0' }}>{rec.closing}</p>
                              </div>
                            )}
                          </div>
                        )}

                        <p style={{ margin: '0.75rem 0 0 0' }}>
                          <strong>Created:</strong>{' '}
                          {item.created_at
                            ? new Date(item.created_at).toLocaleString()
                            : '-'}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}