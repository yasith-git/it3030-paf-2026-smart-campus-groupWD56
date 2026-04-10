import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Pages
import HomePage from './pages/HomePage';
import BookingListPage from './pages/BookingListPage';
import CreateBookingPage from './pages/CreateBookingPage';
import AdminBookingsPage from './pages/AdminBookingPage';
import AdminUsersPage from './pages/AdminUsersPage';
import NotificationsPage from './pages/NotificationsPage';
import LoginPage from './pages/LoginPage';
import CreateIncidentPage from './pages/CreateIncidentPage';
import EditIncidentPage from './pages/EditIncidentPage';
import IncidentMyTicketsPage from './pages/IncidentMyTicketsPage';
import IncidentTicketDetailsPage from './pages/IncidentTicketDetailsPage';
import AdminTicketManagementPage from './pages/AdminTicketManagementPage';
import TechnicianTicketUpdatesPage from './pages/TechnicianTicketUpdatesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ResourceCataloguePage from './pages/ResourceCataloguePage';
import AdminResourcesPage from './pages/AdminResourcesPage';
import AdminResourceSummaryPage from './pages/AdminResourceSummaryPage';
import AdminUserSummaryPage from './pages/AdminUserSummaryPage';

// Components
import Navbar from './components/navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Context
import { AuthProvider } from './context/AuthContext';

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <Navbar />}

      <div
        style={{
          background: 'transparent',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />

              {/* Resource Catalogue */}
              <Route path="/resources" element={<ResourceCataloguePage />} />

              <Route
                path="/bookings"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'TECHNICIAN', 'ADMIN']}>
                    <BookingListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/bookings/new"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}>
                    <CreateBookingPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/bookings"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminBookingsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminUsersPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'TECHNICIAN', 'ADMIN']}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/incidents"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}>
                    <IncidentMyTicketsPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/incidents/new"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}>
                    <CreateIncidentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/incidents/:ticketId/edit"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}>
                    <EditIncidentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/technician/tickets"
                element={
                  <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                    <TechnicianTicketUpdatesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/tickets"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminTicketManagementPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/incidents/:ticketId"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'TECHNICIAN', 'ADMIN']}>
                    <IncidentTicketDetailsPage />
                  </ProtectedRoute>
                }
              />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              <Route
                path="/admin/resources"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminResourcesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/resources/summary"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminResourceSummaryPage />
                  </ProtectedRoute>
                }
              />
              <Route      
                path="/admin/user-summary"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <AdminUserSummaryPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>

        {!hideNavbar && <Footer />}
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;