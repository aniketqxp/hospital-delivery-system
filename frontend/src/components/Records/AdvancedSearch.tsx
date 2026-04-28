import React, { useState } from 'react';
import { DeliveryRecord, SearchFilters } from '../../../../shared/types';
import { searchDeliveries } from '../../services/api';

interface AdvancedSearchProps {
  onSearch: (results: DeliveryRecord[]) => void;
  onLoading: (loading: boolean) => void;
  onError: (error: string | null) => void;
}

const emptyFilters: SearchFilters = {
  patientName: '',
  aadhaarLast4: '',
  serialNumber: '',
  deliveryDate: '',
  babySex: '',
  deliveryType: '',
};

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onLoading, onError }) => {
  const [filters, setFilters] = useState<SearchFilters>(emptyFilters);

  const handleSearch = async () => {
    onLoading(true);
    onError(null);
    try {
      const results = await searchDeliveries(filters);
      onSearch(results);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      onLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(emptyFilters);
    onSearch([]);
  };

  const set = (field: keyof SearchFilters, value: string) =>
    setFilters(prev => ({ ...prev, [field]: value }));

  return (
    <div className="bg-wash border border-line rounded-lg mb-6" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem 1.5rem', marginBottom: '1.25rem' }}>

        <div>
          <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>
            Patient Name
          </label>
          <input
            type="text"
            value={filters.patientName}
            onChange={(e) => set('patientName', e.target.value)}
            placeholder="Search by name…"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>
            Baby Sex
          </label>
          <select value={filters.babySex} onChange={(e) => set('babySex', e.target.value)}>
            <option value="">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Twins (1 Male, 1 Female)">Twins (1 Male, 1 Female)</option>
            <option value="Twins (Both Male)">Twins (Both Male)</option>
            <option value="Twins (Both Female)">Twins (Both Female)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>
            Aadhaar Last 4
          </label>
          <input
            type="text"
            value={filters.aadhaarLast4}
            onChange={(e) => set('aadhaarLast4', e.target.value.replace(/\D/g, ''))}
            maxLength={4}
            placeholder="XXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>
            Delivery Type
          </label>
          <select value={filters.deliveryType} onChange={(e) => set('deliveryType', e.target.value)}>
            <option value="">Any</option>
            <option value="Full Term Normal Delivery">Full Term Normal</option>
            <option value="Vacuum Delivery">Vacuum Delivery</option>
            <option value="Cesarean Section">Cesarean Section</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>
            Serial Number
          </label>
          <input
            type="text"
            value={filters.serialNumber}
            onChange={(e) => set('serialNumber', e.target.value)}
            placeholder="e.g. 2024-01-01-001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-subtle" style={{ marginBottom: '0.5rem' }}>
            Delivery Date
          </label>
          <input
            type="date"
            value={filters.deliveryDate}
            onChange={(e) => set('deliveryDate', e.target.value)}
          />
        </div>

      </div>

      <div className="flex items-center gap-3" style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--color-line)' }}>
        <button onClick={handleSearch} className="btn-primary">
          Search
        </button>
        <button onClick={handleReset} className="btn-secondary">
          Reset
        </button>
      </div>
    </div>
  );
};
