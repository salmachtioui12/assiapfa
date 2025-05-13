import React, {useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Register from './components/Register';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import Logout from './components/Logout';
import Home from './pages/Home';
import MainLayout from './layout/MainLayout';
import Favorites from './pages/Favorites'; 
import HomeCompany from './components/HomeCompany';
import CompanyProfile from './components/CompanyProfile';
import OffersManagement from './components/OffersManagement';
import StudentProfileCreate from "./pages/StudentProfileCreate";
import StudentProfileEdit from "./pages/StudentProfileEdit";
import StudentProfileView from "./pages/StudentProfileView";
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import ApplicationsList from './components/ApplicationsList';
import MyApplications from './pages/MyApplications';

import SearchProfiles from './components/SearchProfiles';
import NvprofileStudent from './components/NvprofileStudent';
import NvprofileCompany from './components/NvprofileCompany';
import CompanyDashboard from './components/CompanyDashboard';
import ChatPage from './components/ChatPage';
import AdminOffre from './components/AdminOffre';
import AdminCandidature from './components/AdminCandidature';
import AdminUser from './components/AdminUser';
import AdminCompanies from './components/AdminCompanies'
import AdminDashboard from './components/AdminDashboard';
import AdminHome from './components/AdminHome';
function App() {
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, []);
  const [token, setToken] = useState(localStorage.getItem('accessToken'));

  const isAdmin = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
          atob(base64)
              .split('')
              .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
              .join('')
      );
      const decoded = JSON.parse(jsonPayload);
      return decoded.role === 'ADMIN';
    } catch (e) {
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    setToken(null);
    axios.defaults.headers.common['Authorization'] = null;
  };

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/change-password" element={<ChangePassword token={token} />} />
          <Route path="/logout" element={<Logout setToken={setToken} />} />
          <Route path="/homecompany" element={<HomeCompany />} />
          <Route path="/company-profile" element={<CompanyProfile />} />
          <Route path="/offers" element={<OffersManagement />} />
          <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
          <Route path="/favorites" element={<MainLayout><Favorites /></MainLayout>} /> {/* Ajouter la route pour les favoris */}
          <Route path="/applications/:offerId" element={<ApplicationsList />} />
          <Route path="/student" element={<Home token={token} />} />
          <Route path="/my-applications" element={<MyApplications />} />
          <Route path="/profile/create" element={<StudentProfileCreate />} />
        <Route path="/profile/edit/:id" element={<StudentProfileEdit />} />
        <Route path="/profile/view" element={<StudentProfileView />} />
        <Route path="/search" element={ <MainLayout><SearchProfiles /></MainLayout>} />
        <Route path="/profilestudent/:userId" element={<NvprofileStudent />} />
        <Route path="/profilecompany/:userId" element={<NvprofileCompany />} />
        <Route path="/ChatPage" element={<ChatPage/>} />
          <Route path="/dashboard" element={<CompanyDashboard />} />
           {/* Routes pour l'administration */}
            <Route path="/admin" element={
              token && isAdmin() ? <AdminHome handleLogout={handleLogout} /> : <Navigate to="/login" />
            }>
               <Route path="/admin" element={
              token && isAdmin() ? <AdminOffre handleLogout={handleLogout} /> : <Navigate to="/login" />
            }></Route>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
            <Route path="/admin/users" element={<AdminUser/>} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            
            <Route path="/admin/candidature" element={<AdminCandidature/>} />
            <Route path="/admin/offers" element={<AdminOffre />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
