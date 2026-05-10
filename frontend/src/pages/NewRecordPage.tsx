import { useNavigate } from 'react-router-dom';
import { DeliveryForm } from '../components/DataEntry/DeliveryForm';
import { createDelivery } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateDeliveryRecord } from '@shared/types';

export function NewRecordPage() {
  const { user, profile, profileError } = useAuth();
  const navigate = useNavigate();

  if (profileError) {
    return (
      <div>
        <h1 className="mb-5">New Delivery Record</h1>
        <p className="text-danger text-sm">
          Cannot create records: {profileError}
        </p>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div>
        <h1 className="mb-5">New Delivery Record</h1>
        <p className="text-subtle text-sm">Loading account…</p>
      </div>
    );
  }

  const handleSubmit = async (data: CreateDeliveryRecord) => {
    await createDelivery(data, profile.hospitalId, user.id);
    navigate('/records');
  };

  return (
    <div>
      <h1 className="mb-5">New Delivery Record</h1>
      <DeliveryForm
        onSubmit={handleSubmit}
        submitLabel="Create Record"
        onCancel={() => navigate('/records')}
      />
    </div>
  );
}
