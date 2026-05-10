import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DeliveryForm } from '../components/DataEntry/DeliveryForm';
import { getDeliveryById, updateDelivery } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateDeliveryRecord, DeliveryRecord } from '@shared/types';

function toFormData(record: DeliveryRecord): CreateDeliveryRecord {
  return {
    patientName: record.patientName,
    patientAge: record.patientAge,
    patientAddress: record.patientAddress,
    patientTaluka: record.patientTaluka,
    patientDistrict: record.patientDistrict,
    aadhaarLast4: record.aadhaarLast4,
    deliveryDate: record.deliveryDate,
    babySex: record.babySex,
    deliveryType: record.deliveryType,
    babyWeightKg: record.babyWeightKg,
  };
}

export function EditRecordPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [record, setRecord] = useState<DeliveryRecord | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getDeliveryById(id)
      .then(setRecord)
      .catch((err) => setLoadError(err instanceof Error ? err.message : 'Failed to load record'));
  }, [id]);

  const handleSubmit = async (data: CreateDeliveryRecord) => {
    if (!id || !user) throw new Error('Not authenticated');
    await updateDelivery(id, data, user.id);
    navigate('/records');
  };

  if (loadError) {
    return (
      <div>
        <p className="text-danger mb-3">Failed to load record: {loadError}</p>
        <button
          onClick={() => navigate('/records')}
          className="text-sm text-subtle hover:text-ink underline"
        >
          ← Back to Records
        </button>
      </div>
    );
  }

  if (!record) {
    return <p className="text-subtle">Loading record...</p>;
  }

  return (
    <div>
      <div className="mb-5">
        <h1>Edit Record</h1>
        <p className="text-sm text-subtle mt-1">
          {record.serialNumber}
        </p>
      </div>

      <DeliveryForm
        initialData={toFormData(record)}
        onSubmit={handleSubmit}
        submitLabel="Save Changes"
        onCancel={() => navigate('/records')}
      />
    </div>
  );
}
