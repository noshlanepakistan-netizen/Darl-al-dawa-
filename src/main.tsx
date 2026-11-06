import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AdminAuthProvider } from './admin/context/AdminAuthContext.tsx';
import { AdminDataProvider } from './admin/context/AdminDataContext.tsx';
import { PatientAuthProvider } from './context/PatientAuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AdminAuthProvider>
    <AdminDataProvider>
      <PatientAuthProvider>
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </PatientAuthProvider>
    </AdminDataProvider>
  </AdminAuthProvider>
);

