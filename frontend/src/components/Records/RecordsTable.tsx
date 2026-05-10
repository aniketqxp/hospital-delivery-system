import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeliveries } from '../../hooks/useDeliveries';
import { format } from 'date-fns';
import { DeliveryRecord, DeliveryType } from '../../../../shared/types';
import { AdvancedSearch } from './AdvancedSearch';
import { RecordDetailsModal } from './RecordDetailsModal';
import { deleteDelivery } from '../../services/api';

function deliveryBadge(type: DeliveryType) {
  const map: Record<DeliveryType, { cls: string; label: string }> = {
    'Full Term Normal Delivery': { cls: 'badge badge-normal',    label: 'Normal'   },
    'Vacuum Delivery':           { cls: 'badge badge-vacuum',    label: 'Vacuum'   },
    'Cesarean Section':          { cls: 'badge badge-cesarean',  label: 'Cesarean' },
  };
  return map[type] ?? { cls: 'badge', label: type };
}

function SkeletonRows() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i}>
          <td><div className="skeleton" style={{ height: '1rem', width: '9rem' }} /></td>
          <td><div className="skeleton" style={{ height: '1rem', width: '2rem' }} /></td>
          <td><div className="skeleton" style={{ height: '1rem', width: '7rem' }} /></td>
          <td><div className="skeleton" style={{ height: '1rem', width: '5rem' }} /></td>
          <td><div className="skeleton" style={{ height: '1rem', width: '5rem' }} /></td>
          <td><div className="skeleton" style={{ height: '1rem', width: '4rem' }} /></td>
        </tr>
      ))}
    </>
  );
}

type MenuState = { id: string; top: number; right: number };
type ConfirmDeleteState = { id: string; top: number; right: number };

export function RecordsTable() {
  const { deliveries, loading, loadingMore, hasMore, error, refetch, loadMore, removeFromCache } = useDeliveries();
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord]   = useState<DeliveryRecord | null>(null);
  const [viewMode, setViewMode]               = useState<'all' | 'search'>('all');
  const [searchResults, setSearchResults]     = useState<DeliveryRecord[]>([]);
  const [searchLoading, setSearchLoading]     = useState(false);
  const [searchError, setSearchError]         = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete]     = useState<ConfirmDeleteState | null>(null);
  const [deletingId, setDeletingId]           = useState<string | null>(null);
  const [deleteError, setDeleteError]         = useState<string | null>(null);
  const [menuState, setMenuState]             = useState<MenuState | null>(null);

  useEffect(() => {
    if (!menuState) return;
    const close = () => setMenuState(null);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuState]);

  useEffect(() => {
    if (!confirmDelete) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setConfirmDelete(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [confirmDelete]);

  const displayed    = viewMode === 'all' ? deliveries : searchResults;
  const isLoading    = viewMode === 'all' ? loading : searchLoading;
  const displayError = viewMode === 'all' ? error   : searchError;

  const switchToAll    = () => { setViewMode('all');    setSearchError(null); };
  const switchToSearch = () => { setViewMode('search'); setSearchResults([]); setSearchError(null); };

  const handleDelete = async (id: string) => {
    setConfirmDelete(null);
    setDeletingId(id);
    setDeleteError(null);
    try {
      await deleteDelivery(id);
      if (viewMode === 'all') {
        removeFromCache(id);
      } else {
        setSearchResults(prev => prev.filter(r => r.id !== id));
      }
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete record');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      {/* ── Toolbar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', marginBottom: '0.5rem' }}>

        {/* Left: count / results label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          {viewMode === 'search' ? (
            <>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-ink)' }}>Search Results</span>
              {searchResults.length > 0 && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-subtle)' }}>
                  — {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                </span>
              )}
            </>
          ) : (
            !loading && (
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-subtle)' }}>
                {deliveries.length}
                {hasMore ? '+' : ''} record{deliveries.length !== 1 ? 's' : ''}
              </span>
            )
          )}
        </div>

        {/* Center: search toggle */}
        <div>
          {viewMode === 'search' ? (
            <button
              onClick={switchToAll}
              className="btn-secondary flex items-center gap-1.5"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close search
            </button>
          ) : (
            <button
              onClick={switchToSearch}
              className="btn-secondary flex items-center gap-1.5"
              style={{ fontSize: 'var(--text-sm)' }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Search
            </button>
          )}
        </div>

        {/* Right: refresh */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingRight: '1rem' }}>
          {viewMode === 'all' && (
            <button
              onClick={refetch}
              style={{ color: 'var(--color-subtle)', padding: '0.25rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.5rem' }}
              className="rounded-md hover:text-ink hover:bg-wash transition-colors"
              aria-label="Refresh"
              title="Refresh"
            >
              <svg style={{ width: '1.5em', height: '1.5em', display: 'block' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 2v6h-6" />
                <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                <path d="M3 22v-6h6" />
                <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Search panel ── */}
      {viewMode === 'search' && (
        <AdvancedSearch
          onSearch={setSearchResults}
          onLoading={setSearchLoading}
          onError={setSearchError}
          onReset={switchToAll}
        />
      )}

      {/* ── Error ── */}
      {displayError && (
        <div className="text-sm text-danger mb-3">
          {displayError} —{' '}
          <button
            onClick={viewMode === 'all' ? refetch : switchToAll}
            className="underline hover:no-underline"
          >
            {viewMode === 'all' ? 'try again' : 'clear search'}
          </button>
        </div>
      )}

      {/* ── Delete error ── */}
      {deleteError && (
        <div
          role="alert"
          className="text-sm text-danger mb-3"
          style={{
            padding: '0.625rem 0.875rem',
            borderRadius: '6px',
            backgroundColor: 'var(--color-danger-bg)',
            border: '1px solid var(--color-danger-bg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span>{deleteError}</span>
          <button
            onClick={() => setDeleteError(null)}
            style={{ color: 'var(--color-danger)', fontWeight: 600, fontSize: 'var(--text-xs)' }}
            className="hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-outer">
        <div className="table-scroll">
          <table className="records-table" style={{ width: '100%', tableLayout: 'fixed' }}>
            <colgroup>
              <col />
              <col style={{ width: '56px' }} />
              <col style={{ width: '176px' }} />
              <col style={{ width: '144px' }} />
              <col style={{ width: '144px' }} />
              <col style={{ width: '64px' }} />
            </colgroup>

            <thead>
              <tr>
                {['Patient', 'Age', 'Date / Time', 'Sex', 'Type', ''].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : displayed.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--color-subtle)' }}>
                    {viewMode === 'all'
                      ? 'No delivery records yet.'
                      : 'No records match your search criteria.'}
                  </td>
                </tr>
              ) : (
                displayed.map((record) => {
                  const badge = deliveryBadge(record.deliveryType);

                  return (
                    <tr
                      key={record.id}
                      className="row-interactive"
                      onClick={() => setSelectedRecord(record)}
                    >
                      <td style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.patientName}
                      </td>
                      <td>
                        {record.patientAge}
                      </td>
                      <td>
                        <div>{format(new Date(record.deliveryDate), 'dd MMM yyyy')}</div>
                        <div style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-subtle)' }}>
                          {format(new Date(record.deliveryDate), 'hh:mm a')}
                        </div>
                      </td>
                      <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {record.babySex}
                      </td>
                      <td>
                        <span className={badge.cls}>{badge.label}</span>
                      </td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              setMenuState(menuState?.id === record.id ? null : {
                                id: record.id,
                                top: rect.bottom + 4,
                                right: window.innerWidth - rect.right,
                              });
                            }}
                            disabled={deletingId === record.id}
                            className="p-1.5 rounded-md text-subtle hover:bg-wash hover:text-ink transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="More options"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="1" />
                              <circle cx="12" cy="5" r="1" />
                              <circle cx="12" cy="19" r="1" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Load more ── */}
      {viewMode === 'all' && !loading && hasMore && (
        <div style={{ display: 'flex', justifyContent: 'center', paddingBlock: '1rem' }}>
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="btn-secondary disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}


      {/* ── Context menu — fixed so it overlays everything ── */}
      {menuState && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: menuState.top,
            right: menuState.right,
            width: '7.5rem',
            backgroundColor: 'var(--color-canvas)',
            border: '1px solid var(--color-line)',
            borderRadius: '6px',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.10)',
            zIndex: 50,
            paddingBlock: '0.25rem',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <button
            onClick={() => { setMenuState(null); navigate(`/records/${menuState.id}/edit`); }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-wash)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            style={{ textAlign: 'left', padding: '0.5rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-ink)', width: '100%', cursor: 'pointer', transition: 'background-color 0.15s ease' }}
          >
            Edit
          </button>
          <button
            onClick={() => {
              const { id, top, right } = menuState;
              setMenuState(null);
              setConfirmDelete({ id, top, right });
            }}
            disabled={deletingId === menuState.id}
            onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            style={{ textAlign: 'left', padding: '0.5rem 1rem', fontSize: 'var(--text-sm)', color: 'var(--color-danger)', width: '100%', cursor: deletingId === menuState.id ? 'not-allowed' : 'pointer', opacity: deletingId === menuState.id ? 0.6 : 1, transition: 'background-color 0.15s ease' }}
          >
            {deletingId === menuState.id ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      )}

      {/* ── Delete confirmation popover ── */}
      {confirmDelete && (
        <>
          <div
            onMouseDown={() => setConfirmDelete(null)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'transparent',
              zIndex: 55,
            }}
          />
          <div
            role="dialog"
            aria-label="Confirm delete"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: confirmDelete.top,
              right: confirmDelete.right,
              width: '15rem',
              backgroundColor: 'var(--color-canvas)',
              border: '1px solid var(--color-line)',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              zIndex: 60,
              padding: '0.875rem 1rem 0.75rem',
            }}
          >
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-ink)', fontWeight: 600, marginBottom: '0.25rem' }}>
              Delete this record?
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)', marginBottom: '0.875rem', lineHeight: 1.45 }}>
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 500,
                  color: 'var(--color-subtle)',
                  padding: '0.375rem 0.625rem',
                  borderRadius: '4px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-wash)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                style={{
                  fontSize: 'var(--text-xs)',
                  fontWeight: 600,
                  color: 'var(--color-danger)',
                  padding: '0.375rem 0.625rem',
                  borderRadius: '4px',
                  transition: 'background-color 0.15s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
