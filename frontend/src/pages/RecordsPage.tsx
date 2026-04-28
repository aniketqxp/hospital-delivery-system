import { Link } from 'react-router-dom';
import { RecordsTable } from '../components/Records/RecordsTable';

export function RecordsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="mb-0">Delivery Records</h1>
        <Link to="/records/new" className="btn-primary">
          + New Record
        </Link>
      </div>
      <RecordsTable />
    </div>
  );
}
