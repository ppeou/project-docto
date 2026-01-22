import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { Toaster } from './components/ui/toaster';
import { SettingsProvider } from './components/SettingsProvider';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ItinerariesPage from './pages/ItinerariesPage';
import ItineraryDetailPage from './pages/ItineraryDetailPage';
import CreateItineraryPage from './pages/CreateItineraryPage';
import CreateAppointmentPage from './pages/CreateAppointmentPage';
import AppointmentDetailPage from './pages/AppointmentDetailPage';
import CreatePrescriptionPage from './pages/CreatePrescriptionPage';
import PrescriptionDetailPage from './pages/PrescriptionDetailPage';
import CreateDoctorNotePage from './pages/CreateDoctorNotePage';
import DoctorNoteDetailPage from './pages/DoctorNoteDetailPage';
import CalendarPage from './pages/CalendarPage';
import SettingsPage from './pages/SettingsPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import DoctorsPage from './pages/DoctorsPage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import InitializeFrequencyOptionsPage from './pages/InitializeFrequencyOptionsPage';
import AdminCollectionDeletionPage from './pages/AdminCollectionDeletionPage';
import AdminSeedDataPage from './pages/AdminSeedDataPage';
import AdminNotificationSettingsPage from './pages/AdminNotificationSettingsPage';
import { LoadingSpinner } from './components/shared/LoadingSpinner';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <BrowserRouter>
      <SettingsProvider>
        <Routes>
        <Route
          path="/auth"
          element={user ? <Navigate to="/" replace /> : <AuthPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/itineraries"
          element={
            <ProtectedRoute>
              <ItinerariesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/itineraries/create"
          element={
            <ProtectedRoute>
              <CreateItineraryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/itineraries/:id"
          element={
            <ProtectedRoute>
              <ItineraryDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/create"
          element={
            <ProtectedRoute>
              <CreateAppointmentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments/:id"
          element={
            <ProtectedRoute>
              <AppointmentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/create"
          element={
            <ProtectedRoute>
              <CreatePrescriptionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prescriptions/:id"
          element={
            <ProtectedRoute>
              <PrescriptionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/create"
          element={
            <ProtectedRoute>
              <CreateDoctorNotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes/:id"
          element={
            <ProtectedRoute>
              <DoctorNoteDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute>
              <PatientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute>
              <DoctorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/specialties"
          element={
            <ProtectedRoute>
              <SpecialtiesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/init-frequency-options"
          element={
            <ProtectedRoute>
              <InitializeFrequencyOptionsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/collections"
          element={
            <ProtectedRoute>
              <AdminCollectionDeletionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/seed-data"
          element={
            <ProtectedRoute>
              <AdminSeedDataPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/notifications"
          element={
            <ProtectedRoute>
              <AdminNotificationSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </SettingsProvider>
    </BrowserRouter>
  );
}

export default App;

