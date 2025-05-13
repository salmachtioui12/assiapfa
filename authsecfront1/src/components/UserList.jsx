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
  // All hooks must be called at the top level
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sortAsc, setSortAsc] = useState(true);

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('/api/admin/dashboard/users-with-managers', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Erreur lors du chargement des utilisateurs.');
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchUsers();
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

  const toggleSortOrder = () => {
    setSortAsc(!sortAsc);
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Voulez-vous vraiment supprimer le profil de ${user.firstname} ${user.lastname} ?`);
    if (!confirmed) return;

    try {
      const token = localStorage.getItem('accessToken');
      let url = '';
      let method = 'delete';

      if (user.role === 'STUDENT') {
        url = `/api/v1/profiles/${user.id}`;
      } else if (user.role === 'MANAGER') {
        url = `/api/v1/companies/profile/delete/${user.id}`;
      } else {
        alert("Suppression non autorisée pour ce type d'utilisateur.");
        return;
      }

      await axios({
        method,
        url,
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Profil supprimé avec succès.');
      fetchUsers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du profil.");
    }
  };

  const filteredUsers = roleFilter === 'ALL'
    ? users
    : users.filter(u => u.role === roleFilter);

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const dateA = new Date(a.profileCreatedAt);
    const dateB = new Date(b.profileCreatedAt);
    return sortAsc ? dateA - dateB : dateB - dateA;
  });

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
  
    {
      title: "Création d'utilisateurs par date",
      description: "Évolution du nombre de nouveaux utilisateurs",
      chart: stats.userStats.usersByDate ? (
        <LineChart
          data={formatDateData(stats.userStats.usersByDate)}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis 
            dataKey="date" 
            angle={-45} 
            textAnchor="end" 
            height={60}
            tick={{ fontSize: 12 }}
          />
          <YAxis />
          <Tooltip 
            formatter={(value) => [`${value} nouveaux utilisateurs`, 'Nombre']}
            labelFormatter={(value) => `Date: ${value}`}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="count" 
            name="Nouveaux utilisateurs" 
            stroke="#4e79a7" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      ) : <EmptyDataPlaceholder message="Aucune donnée de création disponible" />
    },
      {
          title: "Utilisateurs par rôle",
          description: "Répartition des utilisateurs selon leur rôle",
          chart: stats.userStats.usersByRole ? (
            <PieChart>
              <Pie
                data={prepareChartData(stats.userStats.usersByRole, 'Utilisateurs par rôle')}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                paddingAngle={2}
              >
                {prepareChartData(stats.userStats.usersByRole).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} utilisateurs`, 'Nombre']} />
              <Legend layout="horizontal" verticalAlign="bottom" align="center" />
            </PieChart>
          ) : <EmptyDataPlaceholder message="Aucune donnée d'utilisateur disponible" />
        },
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
    

      {/* User List */}
      <div className="container mt-4 mb-4">
        <h2 className="mb-3">Liste des utilisateurs</h2>
        <div className="mb-3">
          <label className="form-label me-2">Filtrer par rôle :</label>
          <select
            className="form-select w-auto d-inline"
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="ALL">Tous</option>
            <option value="STUDENT">Étudiant</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Email</th>
              <th onClick={toggleSortOrder} style={{ cursor: 'pointer' }}>
                Date de création {sortAsc ? '↑' : '↓'}
              </th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, index) => (
              <tr key={index}>
                <td>{user.firstname}</td>
                <td>{user.lastname}</td>
                <td>{user.email}</td>
                <td>{new Date(user.profileCreatedAt).toLocaleDateString('fr-FR')}</td>
                <td>
                  <span className="badge bg-secondary">{user.role}</span>
                </td>
                <td>
                  {(user.role === 'STUDENT' || user.role === 'MANAGER') && (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDelete(user)}
                    >
                      Supprimer
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

     
    </div>
  );
};

export default AdminDashboard;