import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './components/Layout/MainLayout';
import { ErrorBoundary } from './components/UI/ErrorBoundary';
import { LoginPage } from './pages/LoginPage';
import { RecordsPage } from './pages/RecordsPage';
import { NewRecordPage } from './pages/NewRecordPage';
import { EditRecordPage } from './pages/EditRecordPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', color: '#666' }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/records" replace />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/records/new" element={<NewRecordPage />} />
        <Route path="/records/:id/edit" element={<EditRecordPage />} />
        <Route path="*" element={<Navigate to="/records" replace />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
