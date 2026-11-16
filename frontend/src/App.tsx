import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import HelpDeskNavBar from './NavBar';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import TicketPage from './pages/TicketPage';
import UserPage from './pages/UserPage';
import TiqFixPage from './pages/tiqfix/TiqFixPage';
import TiqVisionPage from './pages/vision/TiqVisionPage';
import DashboardPage from './pages/ops/DashboardPage';
import OutageBanner from './pages/ops/OutageBanner';
import { getCurrentUser, isAdmin } from './services/auth';

function RequireLogin({ children }: { children: ReactElement }) {
    return getCurrentUser() ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }: { children: ReactElement }) {
    if (!getCurrentUser()) return <Navigate to="/login" replace />;
    return isAdmin() ? children : <Navigate to="/tickets" replace />;
}

function AppContent() {
    const location = useLocation();
    const isPublicPage = location.pathname === '/' || location.pathname === '/login';

    return (
        <div className="App">
            {!isPublicPage && <HelpDeskNavBar />}
            {!isPublicPage && getCurrentUser() && <OutageBanner />}

            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/home" element={<RequireLogin><HomePage /></RequireLogin>} />
                <Route path="/tickets" element={<RequireLogin><TicketPage /></RequireLogin>} />
                <Route path="/fix" element={<RequireLogin><TiqFixPage /></RequireLogin>} />
                <Route path="/vision" element={<RequireLogin><TiqVisionPage /></RequireLogin>} />
                <Route path="/dashboard" element={<RequireAdmin><DashboardPage /></RequireAdmin>} />
                <Route path="/users" element={<RequireAdmin><UserPage /></RequireAdmin>} />
            </Routes>
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <AppContent />
        </Router>
    );
}
