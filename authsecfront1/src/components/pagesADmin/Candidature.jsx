import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

// Palette de couleurs
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
      const [dashboardResponse, usersByDateResponse, applicationsByDateResponse] = await Promise.all([
        axios.get('/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/dashboard/users-creation-by-date', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('/api/admin/dashboard/applications-by-date', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const normalizedData = {
        userStats: {
          ...dashboardResponse.data.userStats || {},
          usersByDate: usersByDateResponse.data
        },
        companyStats: dashboardResponse.data.companyStats || {},
        offerStats: dashboardResponse.data.offerStats || {},
        studentStats: dashboardResponse.data.studentStats || {},
        recentActivity: dashboardResponse.data.recentActivity || {},
        applicationStats: {
          ...dashboardResponse.data.applicationStats || {},
          applicationsByDate: applicationsByDateResponse.data
        },
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

  const prepareChartData = (data, label) => {
    if (!data || Object.keys(data).length === 0) return [];
    return Object.entries(data).map(([name, value]) => ({ name, value }));
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

  const charts = [
    {
      title: "Statut des postulations",
      description: "Répartition des candidatures par statut",
      chart: stats.applicationStats ? (
        <RadarChart cx="50%" cy="50%" outerRadius="80%"
                    data={[
                      { subject: 'Acceptées', A: stats.applicationStats.applicationsByStatus?.ACCEPTED || 0 },
                      { subject: 'En attente', A: stats.applicationStats.applicationsByStatus?.PENDING || 0 },
                      { subject: 'Rejetées', A: stats.applicationStats.applicationsByStatus?.REJECTED || 0 }
                    ]}
        >
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} />
          <Radar
            name="Candidatures"
            dataKey="A"
            stroke="#4e79a7"
            fill="#4e79a7"
            fillOpacity={0.6}
          />
          <Legend />
          <Tooltip
            formatter={(value) => [`${value} candidatures`, 'Nombre']}
            labelFormatter={(value) => `Statut: ${value}` }
          />
        </RadarChart>
      ) : <EmptyDataPlaceholder message="Aucune donnée de candidature disponible" />
    },
    {
      title: "Postulations par date",
      description: "Nombre de candidatures soumises chaque jour",
      chart: stats.applicationStats?.applicationsByDate ? (
        <LineChart data={formatDateData(stats.applicationStats.applicationsByDate)}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#f28e2b" />
        </LineChart>
      ) : <EmptyDataPlaceholder message="Aucune donnée de postulations par date" />
    }
  ];

  ;

  return (
    <div className="container-fluid p-2 p-md-4 bg-light">
    
      {/* Graphiques */}
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
    </div>
  );
};

export default AdminDashboard;
