import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

