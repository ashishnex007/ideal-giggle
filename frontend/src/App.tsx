import './App.css'
import {Routes, Route, useLocation, Navigate} from "react-router-dom";
import { useSelector } from 'react-redux';
import { RootState } from './hooks/store';

import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Inbox from './pages/Inbox';
import Sidebar from './components/Sidebar';
import OnBoardingPage from './pages/OnBoardingPage';
import OnBoardClient from './pages/OnBoardClient';
import OnBoardFreelancer from './pages/OnBoardFreelancer';
import Profile from './pages/Profile';
import PaymentDashboard from './pages/PaymentDashboard';
import AddCredits from './pages/AddCredits';
import FlashProjects from './pages/FlashProjects';
import Services from './pages/Services';
import Contact from './pages/Contact';
import VideoCall from './components/calls/VideoCall';
import Notifications from './pages/Notifications';
import NewNotification from './pages/NewNotification';
import ResourcePage from './pages/ResourcesPage';
import ComingSoon from './pages/ComingSoon';

function App() {
  const location = useLocation();
  const normalizedPathname = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
  const paths = ['/dashboard', '/inbox', '/profile', '/payments', '/projects', '/notifications', '/notifications/new', '/resources'];
  const showSidebar = paths.includes(normalizedPathname);

  // * check user
  const user = useSelector((state: RootState) => state.auth.user);
  
  return (
    <div className={showSidebar ? "flex h-screen overflow-hidden" : ""}>
      {/* @ts-ignore */}
      {showSidebar && <Sidebar className="flex-shrink-0" />}
      <div className={showSidebar ? "flex-grow overflow-x-auto" : ""}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path='/onboard' element={<OnBoardingPage/>}/>
          <Route path='/onboard/client' element={<OnBoardClient/>}/>
          <Route path='/onboard/freelancer' element={<OnBoardFreelancer/>}/>
          <Route
            path="/dashboard"
            element={user?.role === "admin" ? <AdminDashboard /> : <Dashboard />} 
          />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/notifications/new" element={<NewNotification />} />
          <Route path='/projects' element={<FlashProjects/>}/>
          {user?.role !== "client" && (
            <Route path="/resources" element={<ResourcePage />} />
          )}
          {user?.role === "client" && (
            <Route path="/resources" element={<Navigate to="/dashboard" replace />} />
          )}
          <Route path='/coming-soon' element={<ComingSoon/>}/>
          <Route path='/payments' element={<PaymentDashboard/>}/>
          <Route path='/payments/add-credits' element={<AddCredits/>}/>
          <Route path="/profile" element={<Profile />} />

          <Route path="/calls" element={<VideoCall />} />
        </Routes>
      </div>
    </div>
  )
}

export default App;