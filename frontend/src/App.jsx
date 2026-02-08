// src/App.jsx
import './App.css'
import { Routes, Route } from 'react-router-dom';

// Home page
import Header from './components/HomePage/Header.jsx';
import Home from './pages/Home/Home.jsx';
import About from './pages/Home/AboutUs.jsx';
import Contact from './pages/Home/ContactUs.jsx';
import Footer from "./components/HomePage/Footer.jsx";
import Register from "./pages/Home/Register.jsx";
import Privacy from "./pages/Home/Privacy.jsx";

// Login pages and all pages after login successfully
import Login from "./pages/Home/Login.jsx";
import UsersDashboard from "./pages/UserDashboard/UsersDashboard.jsx";
import UserLayout from "./pages/UserDashboard/UserLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleRoute from "./components/RoleRoute.jsx";
import OAuthCallback from "./pages/Home/OAuthCallback.jsx"
import ForgotPassword from "./pages/Home/ForgotPassword.jsx"
import ResetPassword from "./pages/Home/ResetPassword.jsx";

// User Dashboard
import MyProfile from "./pages/UserDashboard/MyProfile.jsx";
import NewReport from "./pages/UserDashboard/NewReport.jsx";
import MyReport from "./pages/UserDashboard/MyReport.jsx";
import UserReportDetail from "./pages/UserDashboard/UserReportDetail.jsx";
import MyInbox from "./pages/UserDashboard/MyInbox.jsx";
import ConversationView from "./pages/OfficerDashboard/ConversationView.jsx";
import AnnouncementDetail from "./components/AnnouncementDetail.jsx";

// Officer Dashboard
import OfficerDashboard from "./pages/OfficerDashboard/OfficerDashboard.jsx";
import AssignedReports from "./pages/OfficerDashboard/AssignedReports.jsx";
import OfficerInbox from "./pages/OfficerDashboard/MyInbox.jsx"
import OfficerProfile from "./pages/OfficerDashboard/OfficerProfile.jsx";
import ReportDetails from "./pages/OfficerDashboard/ReportDetails.jsx";
import CommunityReports from "./pages/OfficerDashboard/CommunityReports.jsx";

// Administrator Dashboard
import AdminLayout from "./pages/AdministratorDashboard/AdminLayout.jsx";
import AdminDashboard from "./pages/AdministratorDashboard/AdministratorDashboard.jsx";
import Reports from "./pages/AdministratorDashboard/Reports.jsx";
import OfficerPerformance from "./pages/AdministratorDashboard/OfficerPerformance.jsx"
import Announcement from "./pages/AdministratorDashboard/Announcement.jsx"
import AdminInbox from "./pages/AdministratorDashboard/MyInbox.jsx"
import AdminProfile from "./pages/AdministratorDashboard/AdminProfile.jsx"
import OfficerLayout from "./pages/OfficerDashboard/OfficerLayout.jsx";

function App() {
    return (
        <>
            <Header />

            <Routes>

                {/* Public routes - Home Page */}
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/login" element={<Login />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/oauth2/callback" element={<OAuthCallback />} />
                <Route path="/oauth-callback" element={<OAuthCallback />} />

                {/* Protected User Dashboard routes - wrapped with UserLayout */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<UsersDashboard />} />
                </Route>

                <Route
                    path="/user-dashboard"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<UsersDashboard />} />
                </Route>

                <Route
                    path="/new-report"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<NewReport />} />
                </Route>

                <Route
                    path="/user-report"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<MyReport />} />
                </Route>

                <Route
                    path="/user-report/:id"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<UserReportDetail />} />
                </Route>

                <Route
                    path="/user/announcements/:id"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<AnnouncementDetail />} />
                </Route>

                <Route
                    path="/my-inbox"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<MyInbox />} />
                </Route>

                <Route
                    path="/conversation-view"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<ConversationView />} />
                </Route>

                <Route
                    path="/user-profile"
                    element={
                        <ProtectedRoute>
                            <UserLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route index element={<MyProfile />} />
                </Route>

                {/* Officer dashboard - requires OFFICER role */}
                <Route path="/officer" element={
                    <RoleRoute allowedRoles={["OFFICER"]}>
                        <OfficerLayout />
                    </RoleRoute>
                }>
                    {/*All pages in Officer Dashboard*/}
                    <Route index element={<OfficerDashboard />} />
                    <Route path="dashboard" element={<OfficerDashboard />} />
                    <Route path="reports" element={<AssignedReports />} />
                    <Route path="inbox" element={<OfficerInbox />} />
                    <Route path="reports/:id" element={<ReportDetails />} />
                    <Route path="community" element={<CommunityReports />} />
                    <Route path="profile" element={<OfficerProfile />} />
                </Route>

                {/* Administrator Dashboard - Nested under /admin with AdminLayout */}
                <Route
                    path="/admin"
                    element={
                        <RoleRoute allowedRoles={["ADMIN"]}>
                            <AdminLayout />
                        </RoleRoute>
                    }
                >
                    {/* Default route inside /admin */}
                    <Route index element={<AdminDashboard />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="officerperformance" element={<OfficerPerformance />} />
                    <Route path="announcements" element={<Announcement />} />
                    <Route path="inbox" element={<AdminInbox />} />
                    <Route path="profile" element={<AdminProfile />} />
                </Route>

                {/* Error pages */}
                <Route
                    path="/403"
                    element={
                        <div className="error-page">
                            <h1>403 - Forbidden</h1>
                            <p>You don't have permission to access this page.</p>
                        </div>
                    }
                />

                {/* Catch-all for undefined routes */}
                <Route
                    path="*"
                    element={
                        <div className="error-page">
                            <h1>404 - Page Not Found</h1>
                            <p>The page you're looking for doesn't exist.</p>
                        </div>
                    }
                />
            </Routes>

            <Footer />
        </>
    )
}

export default App;


