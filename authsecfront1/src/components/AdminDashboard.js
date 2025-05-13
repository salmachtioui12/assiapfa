import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

// Color palette
const COLORS = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc948', '#b07aa1', '#ff9da7', '#9c755f', '#bab0ac'];

const EmptyDataPlaceholder = ({ message }) => (
  <div className="d-flex justify-content-center align-items-center h-100">
    <div className="text-center text-muted p-4">
      <i className="bi bi-bar-chart fs-1"></i>
      <p className="mt-2 mb-0">{message}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const [dashboardResponse, usersByDateResponse] = await Promise.all([
        axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/dashboard/users-creation-by-date', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      // Normalize data
      const normalizedData = {
        userStats: {
          ...dashboardResponse.data.userStats || {},
          usersByDate: usersByDateResponse.data
        },
        companyStats: dashboardResponse.data.companyStats || {},
        offerStats: dashboardResponse.data.offerStats || {},
        studentStats: dashboardResponse.data.studentStats || {},
        recentActivity: dashboardResponse.data.recentActivity || {},
        applicationStats: dashboardResponse.data.applicationStats || {},
        documentStats: dashboardResponse.data.documentStats || {}
      };

      setStats(normalizedData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Fonction pour formater les données de date
  const formatDateData = (dateMap) => {
    if (!dateMap || typeof dateMap !== 'object') return [];
    
    return Object.entries(dateMap).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      }),
      count
    }));
  };

  // Prepare chart data
  const prepareChartData = (data, label) => {
    if (!data || Object.keys(data).length === 0) return [];
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  };

  const statusColors = {
    PENDING: 'warning',
    ACCEPTED: 'success',
    REJECTED: 'danger'
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-80 flex-column">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h6 className="text-muted">Chargement des données...</h6>
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-80 flex-column p-3">
        <div className="alert alert-danger mb-3 w-100" style={{ maxWidth: '600px' }}>
          <h6 className="fw-bold mb-2">Erreur</h6>
          <p className="mb-0">{error}</p>
        </div>
        <button
          className="btn btn-primary btn-lg px-4 py-2 fw-bold shadow"
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-80 flex-column p-3">
        <div className="alert alert-warning mb-3 w-100" style={{ maxWidth: '600px' }}>
          <h6 className="fw-bold mb-2">Aucune donnée disponible</h6>
          <p className="mb-0">Les données du tableau de bord n'ont pas pu être chargées.</p>
        </div>
        <button
          className="btn btn-primary btn-lg px-4 py-2 fw-bold shadow"
          onClick={() => window.location.reload()}
        >
          Actualiser
        </button>
      </div>
    );
  }

  // Main charts configuration
  const charts = [


   
   
  ];

  // Stats cards data
  const statsCards = [
    { label: 'Utilisateurs', value: stats.userStats.totalUsers || 0 },
    { label: 'Entreprises', value: stats.companyStats.totalCompanies || 0 },
    { label: 'Offres', value: stats.offerStats.totalOffers || 0 },
    { label: 'Stagiaires', value: stats.studentStats.totalStudents || 0 },
    { label: 'Taux acceptation', value: stats.applicationStats ? `${stats.applicationStats.conversionRate?.toFixed(1)}%` : '0%' },
  
  ];

  return (
    <div className="container-fluid p-2 p-md-4 bg-light">
      {/* Header */}
      <div className="card border-0 mb-4" style={{
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)',
        border: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <div className="card-body p-3 p-md-4">
          <h1 className="fw-bold mb-3" style={{ color: '#4e79a7' }}>Tableau de bord administrateur</h1>
          <p className="text-muted mb-0" style={{ maxWidth: '800px' }}>
            Vue d'ensemble complète de la plateforme avec statistiques et analyses.
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-sm">
        {statsCards.map((stat, index) => (
          <div key={index} className="text-center px-3 py-2">
            <div className="text-muted small fw-medium">{stat.label}</div>
            <div className="fw-bold fs-3" style={{ color: '#4e79a7' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="row g-3">
        {charts.map((item, index) => (
          <div key={index} className="col-12 col-lg-6 mb-3">
            <div className="card shadow-sm h-100 rounded-3 border-0">
              <div className="card-body p-3">
                <h5 className="fw-bold mb-2" style={{ color: '#4e79a7' }}>{item.title}</h5>
                <p className="text-muted small mb-3">{item.description}</p>
                <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {item.chart}
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="row mt-4">
        <div className="col-12">
          <div className="card shadow-sm rounded-3 border-0">
            <div className="card-body p-3">
              <h5 className="fw-bold mb-3" style={{ color: '#4e79a7' }}>Activité récente</h5>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                <div className="list-group list-group-flush">
                  {stats.recentActivity?.recentCompanies?.map((company, index) => (
                    <div key={`company-${index}`} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Nouvelle entreprise:</strong> {company.name}
                        </div>
                        <small className="text-muted">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <small className="text-muted">{company.sector}</small>
                    </div>
                  ))}
                  {stats.recentActivity?.recentOffers?.map((offer, index) => (
                    <div key={`offer-${index}`} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Nouvelle offre:</strong> {offer.title}
                        </div>
                        <small className="text-muted">
                          {new Date(offer.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <small className="text-muted">{offer.companyName}</small>
                    </div>
                  ))}
                  {stats.recentActivity?.recentApplications?.map((app, index) => (
                    <div key={`app-${index}`} className="list-group-item">
                      <div className="d-flex justify-content-between">
                        <div>
                          <strong>Postulation:</strong> {app.studentName}
                        </div>
                        <small className="text-muted">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <small className="text-muted">{app.offerTitle}</small>
                        <span className={`badge bg-${statusColors[app.status]}`}>
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;