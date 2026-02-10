import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@core/services/firebase';
import { store } from '@core/store';
import { setUser, setLoading } from '@core/stores/authStore';
import { setTheme, setFontSize } from '@core/stores/preferencesStore';
import AppLayout from './components/layouts/AppLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
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
import CreatePatientPage from './pages/CreatePatientPage';
import DoctorsPage from './pages/DoctorsPage';
import CreateDoctorPage from './pages/CreateDoctorPage';
import EditDoctorPage from './pages/EditDoctorPage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import InitializeFrequencyOptionsPage from './pages/InitializeFrequencyOptionsPage';
import AdminCollectionDeletionPage from './pages/AdminCollectionDeletionPage';
import AdminSeedDataPage from './pages/AdminSeedDataPage';
import AdminNotificationSettingsPage from './pages/AdminNotificationSettingsPage';

function App() {
  useEffect(() => {
    // Initialize preferences from store
    const theme = localStorage.getItem('theme') || 'system';
    const fontSize = localStorage.getItem('fontSize') || 'regular';
    store.dispatch(setTheme(theme));
    store.dispatch(setFontSize(fontSize));

    // Listen for auth state changes
    if (auth) {
      const unsubscribe = onAuthStateChanged(
        auth,
        (user) => {
          // Serialize user before dispatching to avoid Redux serialization warnings
          // The reducer also serializes, but we do it here to avoid action payload warnings
          store.dispatch(setUser(user));
          store.dispatch(setLoading(false));
        },
        (error) => {
          console.error('Auth state change error:', error);
          store.dispatch(setLoading(false));
        }
      );

      return () => unsubscribe();
    } else {
      // If Firebase is not configured, set loading to false so app can render
      store.dispatch(setLoading(false));
    }
  }, []);

  return (
    <Provider store={store}>
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="itineraries" element={<ItinerariesPage />} />
          <Route path="itineraries/create" element={<CreateItineraryPage />} />
          <Route path="itineraries/:id" element={<ItineraryDetailPage />} />
          <Route path="appointments/create" element={<CreateAppointmentPage />} />
          <Route path="appointments/:id" element={<AppointmentDetailPage />} />
          <Route path="prescriptions/create" element={<CreatePrescriptionPage />} />
          <Route path="prescriptions/:id" element={<PrescriptionDetailPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="notes/create" element={<CreateDoctorNotePage />} />
          <Route path="notes/:id" element={<DoctorNoteDetailPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="patients/create" element={<CreatePatientPage />} />
          <Route path="patients/:id" element={<PatientDetailPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="doctors/create" element={<CreateDoctorPage />} />
          <Route path="doctors/:id/edit" element={<EditDoctorPage />} />
          <Route path="specialties" element={<SpecialtiesPage />} />
          <Route path="admin/init-frequency-options" element={<InitializeFrequencyOptionsPage />} />
          <Route path="admin/collections" element={<AdminCollectionDeletionPage />} />
          <Route path="admin/seed-data" element={<AdminSeedDataPage />} />
          <Route path="admin/notifications" element={<AdminNotificationSettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Provider>
  );
}

export default App;
