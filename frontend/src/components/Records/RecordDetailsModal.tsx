import React from 'react';
import { format } from 'date-fns';
import { DeliveryRecord } from '../../../../shared/types';

interface RecordDetailsModalProps {
  record: DeliveryRecord;
  onClose: () => void;
}

interface FieldRowProps {
  label: string;
  value: React.ReactNode;
  divider?: boolean;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, value, divider }) => (
  <div style={{
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '0.8125rem 1.25rem',
    borderTop: divider ? '1px solid var(--color-line)' : undefined,
  }}>
    <span style={{
      fontSize: 'var(--text-sm)',
      color: 'var(--color-subtle)',
      minWidth: '8.5rem',
      flexShrink: 0,
      lineHeight: 1.5,
    }}>
      {label}
    </span>
    <span style={{
      fontSize: 'var(--text-sm)',
      color: 'var(--color-ink)',
      fontWeight: 400,
      flex: 1,
      lineHeight: 1.5,
    }}>
      {value}
    </span>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h3 style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--color-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      marginBottom: '0.625rem',
      paddingLeft: '0.125rem',
    }}>
      {title}
    </h3>
    <div style={{
      border: '1px solid var(--color-line)',
      borderRadius: '8px',
      overflow: 'hidden',
      backgroundColor: 'var(--color-canvas)',
    }}>
      {children}
    </div>
  </section>
);


export const RecordDetailsModal: React.FC<RecordDetailsModalProps> = ({ record, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ backgroundColor: 'var(--color-overlay)' }}
      onClick={onClose}
    >
      <div
        className="h-full w-full max-w-lg overflow-y-auto flex flex-col shadow-2xl animate-slide-in-right"
        style={{ backgroundColor: 'var(--color-wash)', borderLeft: '1px solid var(--color-line)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div style={{
          backgroundColor: 'var(--color-canvas)',
          borderBottom: '1px solid var(--color-line)',
          padding: '1.5rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '1rem',
        }}>
          <div>
            <p style={{
              fontSize: 'var(--text-2xs)',
              fontWeight: 500,
              color: 'var(--color-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '0.3125rem',
            }}>
              Patient Record
            </p>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: 'var(--color-ink)',
              letterSpacing: '-0.01em',
              lineHeight: 1.25,
            }}>
              {record.patientName}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="text-subtle hover:text-ink hover:bg-wash rounded-md transition-colors"
            style={{ padding: '0.375rem', marginTop: '-0.125rem', flexShrink: 0 }}
            aria-label="Close panel"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>

          <Section title="Delivery">
            <FieldRow
              label="Date & Time"
              value={
                <>
                  {format(new Date(record.deliveryDate), 'dd MMM yyyy')}
                  <span style={{ color: 'var(--color-subtle)', marginLeft: '0.5rem' }}>
                    {format(new Date(record.deliveryDate), 'HH:mm')}
                  </span>
                </>
              }
            />
            <FieldRow label="Type" value={record.deliveryType} divider />
            <FieldRow label="Baby Sex" value={record.babySex} divider />
            <FieldRow label="Hospital" value={record.hospitalName} divider />
          </Section>

          <Section title="Patient">
            <FieldRow label="Age" value={`${record.patientAge} years`} />
            <FieldRow
              label="Aadhaar (Last 4)"
              value={
                record.aadhaarLast4
                  ? <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>{record.aadhaarLast4}</span>
                  : <span style={{ color: 'var(--color-faint)', fontStyle: 'italic', fontWeight: 400 }}>Not provided</span>
              }
              divider
            />
            <FieldRow
              label="Address"
              value={
                <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65 }}>
                  {record.patientAddress}
                </span>
              }
              divider
            />
          </Section>

        </div>

        {/* ── Footer ── */}
        <div style={{
          backgroundColor: 'var(--color-canvas)',
          borderTop: '1px solid var(--color-line)',
          padding: '1rem 1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-faint)', marginBottom: '0.1875rem' }}>Created</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
              {format(new Date(record.createdAt), 'dd MMM yyyy')}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-faint)', marginBottom: '0.1875rem' }}>Last updated</p>
            <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-subtle)' }}>
              {format(new Date(record.updatedAt), 'dd MMM yyyy')}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
