import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { AdminAuthProvider } from './admin/context/AdminAuthContext.tsx';
import { AdminDataProvider } from './admin/context/AdminDataContext.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <AdminAuthProvider>
    <AdminDataProvider>
      <App />
    </AdminDataProvider>
  </AdminAuthProvider>
);
