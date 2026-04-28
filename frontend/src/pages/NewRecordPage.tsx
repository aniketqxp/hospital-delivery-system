import { useNavigate } from 'react-router-dom';
import { DeliveryForm } from '../components/DataEntry/DeliveryForm';
import { createDelivery } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { CreateDeliveryRecord } from '../../../shared/types';

export function NewRecordPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (data: CreateDeliveryRecord) => {
    if (!profile || !user) throw new Error('Not authenticated');
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
