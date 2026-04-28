import React, { useState } from 'react';
import { CreateDeliveryRecord } from '../../../../shared/types';

const defaultFormState: CreateDeliveryRecord = {
  patientName: '',
  patientAge: 0,
  patientAddress: '',
  aadhaarLast4: '',
  deliveryDate: new Date(),
  babySex: 'Male',
  deliveryType: 'Full Term Normal Delivery',
};

interface DeliveryFormProps {
  initialData?: CreateDeliveryRecord;
  onSubmit: (data: CreateDeliveryRecord) => Promise<void>;
  submitLabel?: string;
  onCancel?: () => void;
}

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
    <h3 style={{
      fontSize: 'var(--text-xs)',
      fontWeight: 600,
      color: 'var(--color-subtle)',
      textTransform: 'uppercase',
      letterSpacing: '0.07em',
      flexShrink: 0,
    }}>
      {children}
    </h3>
    <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-faint)' }} />
  </div>
);

const Label: React.FC<{ children: React.ReactNode; htmlFor?: string }> = ({ children, htmlFor }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-subtle"
    style={{ marginBottom: '0.5rem' }}
  >
    {children}
  </label>
);

export const DeliveryForm: React.FC<DeliveryFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = 'Create Delivery Record',
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateDeliveryRecord>(initialData ?? defaultFormState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '32rem', paddingTop: '0.75rem' }}>

      {/* ── Patient Information ── */}
      <section>
        <SectionHeading>Patient Information</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <Label>Patient Name</Label>
            <input
              type="text"
              name="patientName"
              value={formData.patientName}
              onChange={handleInputChange}
              required
              placeholder="Full name"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <Label>Age</Label>
              <input
                type="number"
                name="patientAge"
                value={formData.patientAge || ''}
                onChange={handleNumberChange}
                required
                min="1"
                max="120"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-subtle"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}
              >
                Aadhaar Last 4
                <span className="text-xs font-normal text-faint">(optional)</span>
              </label>
              <input
                type="text"
                name="aadhaarLast4"
                value={formData.aadhaarLast4 ?? ''}
                onChange={handleInputChange}
                pattern="[0-9]{4}"
                title="Exactly 4 digits"
                maxLength={4}
                placeholder="XXXX"
              />
            </div>
          </div>

          <div>
            <Label>Address</Label>
            <textarea
              name="patientAddress"
              value={formData.patientAddress}
              onChange={handleInputChange}
              required
              rows={3}
              placeholder="Patient's residential address"
            />
          </div>

        </div>
      </section>

      {/* ── Delivery Information ── */}
      <section style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-faint)' }}>
        <SectionHeading>Delivery Information</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div>
            <Label>Date &amp; Time</Label>
            <input
              type="datetime-local"
              value={
                formData.deliveryDate instanceof Date
                  ? formData.deliveryDate.toISOString().slice(0, 16)
                  : new Date(formData.deliveryDate).toISOString().slice(0, 16)
              }
              onChange={(e) => setFormData({ ...formData, deliveryDate: new Date(e.target.value) })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <Label>Baby Sex</Label>
              <select name="babySex" value={formData.babySex} onChange={handleInputChange} required>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Twins (1 Male, 1 Female)">Twins (1 Male, 1 Female)</option>
                <option value="Twins (Both Male)">Twins (Both Male)</option>
                <option value="Twins (Both Female)">Twins (Both Female)</option>
              </select>
            </div>
            <div>
              <Label>Delivery Type</Label>
              <select name="deliveryType" value={formData.deliveryType} onChange={handleInputChange} required>
                <option value="Full Term Normal Delivery">Full Term Normal Delivery</option>
                <option value="Vacuum Delivery">Vacuum Delivery</option>
                <option value="Cesarean Section">Cesarean Section</option>
              </select>
            </div>
          </div>

        </div>
      </section>

      {error && (
        <div className="text-sm text-danger" style={{ marginTop: '1.5rem', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--color-danger-bg)', backgroundColor: 'var(--color-danger-bg)' }}>
          {error}
        </div>
      )}

      <div className="flex items-center gap-3" style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-line)' }}>
        <button
          type="submit"
          disabled={submitting}
          className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-secondary">
            Cancel
          </button>
        )}
      </div>

    </form>
  );
};
