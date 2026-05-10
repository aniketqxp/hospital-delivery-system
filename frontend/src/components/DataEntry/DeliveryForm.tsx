import React, { useState } from 'react';
import { CreateDeliveryRecord } from '@shared/types';

const defaultFormState: CreateDeliveryRecord = {
  patientName: '',
  patientAge: 0,
  patientAddress: '',
  patientTaluka: '',
  patientDistrict: '',
  aadhaarLast4: '',
  deliveryDate: new Date(),
  babySex: 'Male',
  deliveryType: 'Full Term Normal Delivery',
  babyWeightKg: undefined,
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

function to24Hour(h: number, period: 'AM' | 'PM'): number {
  if (period === 'AM') return h === 12 ? 0 : h;
  return h === 12 ? 12 : h + 12;
}

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

    const trimmedName = formData.patientName.trim();
    const trimmedAddress = formData.patientAddress.trim();

    if (!trimmedName) {
      setError('Patient name cannot be empty.');
      return;
    }
    if (!trimmedAddress) {
      setError('Address cannot be empty.');
      return;
    }
    if (!Number.isInteger(formData.patientAge) || formData.patientAge < 1 || formData.patientAge > 120) {
      setError('Age must be a whole number between 1 and 120.');
      return;
    }
    const dDateLocal = formData.deliveryDate instanceof Date ? formData.deliveryDate : new Date(formData.deliveryDate);
    if (isNaN(dDateLocal.getTime())) {
      setError('Delivery date and time are invalid.');
      return;
    }
    if (dDateLocal.getTime() > Date.now()) {
      setError('Delivery date cannot be in the future.');
      return;
    }
    if (
      formData.aadhaarLast4 &&
      formData.aadhaarLast4.trim() !== '' &&
      !/^[0-9]{4}$/.test(formData.aadhaarLast4.trim())
    ) {
      setError('Aadhaar Last 4 must be exactly 4 digits.');
      return;
    }
    if (formData.babyWeightKg != null && (formData.babyWeightKg <= 0 || formData.babyWeightKg > 8)) {
      setError('Baby weight must be between 0.1 and 8 kg.');
      return;
    }

    const sanitized: CreateDeliveryRecord = {
      ...formData,
      patientName: trimmedName,
      patientAddress: trimmedAddress,
      patientTaluka: formData.patientTaluka?.trim() || undefined,
      patientDistrict: formData.patientDistrict?.trim() || undefined,
      aadhaarLast4: formData.aadhaarLast4?.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await onSubmit(sanitized);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const dDate = formData.deliveryDate instanceof Date ? formData.deliveryDate : new Date(formData.deliveryDate);
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dateStr = !isNaN(dDate.getTime())
    ? `${dDate.getFullYear()}-${pad(dDate.getMonth() + 1)}-${pad(dDate.getDate())}`
    : '';

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  const hours24 = !isNaN(dDate.getTime()) ? dDate.getHours() : 0;
  const hours12 = hours24 === 0 ? 12 : hours24 > 12 ? hours24 - 12 : hours24;
  const ampm: 'AM' | 'PM' = hours24 < 12 ? 'AM' : 'PM';
  const currentMinutes = !isNaN(dDate.getTime()) ? dDate.getMinutes() : 0;

  const updateTime = (newHours24: number, newMinutes: number) => {
    const updated = new Date(dDate);
    updated.setHours(newHours24, newMinutes, 0, 0);
    setFormData(prev => ({ ...prev, deliveryDate: updated }));
  };

  const selectStyle: React.CSSProperties = { flex: '0 0 auto' };

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
              maxLength={100}
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
                step="1"
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
                inputMode="numeric"
                name="aadhaarLast4"
                value={formData.aadhaarLast4 ?? ''}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setFormData(prev => ({ ...prev, aadhaarLast4: digitsOnly }));
                }}
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
              maxLength={400}
              placeholder="House / street / village"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label
                className="text-sm font-medium text-subtle"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}
              >
                Taluka
                <span className="text-xs font-normal text-faint">(optional)</span>
              </label>
              <input
                type="text"
                name="patientTaluka"
                value={formData.patientTaluka ?? ''}
                onChange={handleInputChange}
                maxLength={80}
                placeholder="e.g. Shirur"
              />
            </div>
            <div>
              <label
                className="text-sm font-medium text-subtle"
                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}
              >
                District
                <span className="text-xs font-normal text-faint">(optional)</span>
              </label>
              <input
                type="text"
                name="patientDistrict"
                value={formData.patientDistrict ?? ''}
                onChange={handleInputChange}
                maxLength={80}
                placeholder="e.g. Pune"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Delivery Information ── */}
      <section style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--color-faint)' }}>
        <SectionHeading>Delivery Information</SectionHeading>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <Label>Delivery Date</Label>
              <input
                type="date"
                value={dateStr}
                max={todayStr}
                onChange={(e) => {
                  if (e.target.value) {
                    const updated = new Date(`${e.target.value}T${pad(hours24)}:${pad(currentMinutes)}`);
                    setFormData(prev => ({ ...prev, deliveryDate: updated }));
                  }
                }}
                required
              />
            </div>
            <div>
              <Label>Delivery Time</Label>
              <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                <select
                  value={hours12}
                  onChange={(e) => updateTime(to24Hour(parseInt(e.target.value, 10), ampm), currentMinutes)}
                  style={selectStyle}
                  required
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <span style={{ color: 'var(--color-subtle)', fontWeight: 600, userSelect: 'none' }}>:</span>
                <select
                  value={currentMinutes}
                  onChange={(e) => updateTime(hours24, parseInt(e.target.value, 10))}
                  style={selectStyle}
                  required
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>{pad(i)}</option>
                  ))}
                </select>
                <select
                  value={ampm}
                  onChange={(e) => updateTime(to24Hour(hours12, e.target.value as 'AM' | 'PM'), currentMinutes)}
                  style={selectStyle}
                  required
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>
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

          <div style={{ maxWidth: '14rem' }}>
            <label
              className="text-sm font-medium text-subtle"
              style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}
            >
              Baby Weight
              <span className="text-xs font-normal text-faint">(kg, optional)</span>
            </label>
            <input
              type="number"
              name="babyWeightKg"
              value={formData.babyWeightKg ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                setFormData(prev => ({ ...prev, babyWeightKg: val === '' ? undefined : parseFloat(val) }));
              }}
              min="0.1"
              max="8"
              step="0.01"
              placeholder="e.g. 3.20"
            />
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
