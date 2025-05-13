import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';

const Offresadmin = () => {
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    active: '',
    companyName: '',
    sortDate: 'desc',
  });

  const [uniqueTypes, setUniqueTypes] = useState([]);
  const [uniqueLocations, setUniqueLocations] = useState([]);
  const [uniqueCompanies, setUniqueCompanies] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const [dashboardRes, usersByDateRes, offersRes] = await Promise.all([
          axios.get('/api/admin/dashboard', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/admin/dashboard/users-creation-by-date', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('/api/admin/dashboard/offers', {
            headers: { Authorization: `Bearer ${token}` }
          }),
        ]);

        const allOffers = offersRes.data;

        setStats({
          userStats: {
            ...dashboardRes.data.userStats,
            usersByDate: usersByDateRes.data
          },
          companyStats: dashboardRes.data.companyStats,
          offerStats: dashboardRes.data.offerStats,
          studentStats: dashboardRes.data.studentStats,
          recentActivity: dashboardRes.data.recentActivity,
          applicationStats: dashboardRes.data.applicationStats,
          documentStats: dashboardRes.data.documentStats
        });

        setOffers(allOffers);
        setFilteredOffers(allOffers);

        setUniqueTypes([...new Set(allOffers.map((o) => o.type))]);
        setUniqueLocations([...new Set(allOffers.map((o) => o.location))]);
        setUniqueCompanies([...new Set(allOffers.map((o) => o.companyName))]);

      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  useEffect(() => {
    let result = [...offers];

    if (filters.type) result = result.filter((o) => o.type === filters.type);
    if (filters.location) result = result.filter((o) => o.location === filters.location);
    if (filters.active !== '') result = result.filter((o) => String(o.active) === filters.active);
    if (filters.companyName) result = result.filter((o) => o.companyName === filters.companyName);

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return filters.sortDate === 'asc' ? dateA - dateB : dateB - dateA;
    });

    setFilteredOffers(result);
  }, [filters, offers]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const offersByDate = offers.reduce((acc, offer) => {
    const date = new Date(offer.createdAt).toLocaleDateString('fr-FR');
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const offersChartData = Object.entries(offersByDate).map(([date, count]) => ({
    date,
    count
  }));

  const charts = [
    {
      title: "Statut des offres",
      description: "Répartition des offres selon leur statut",
      chart: (
        <BarChart
          data={[
            { name: 'Actives', value: stats?.offerStats?.activeOffers || 0 },
            { name: 'Inactives', value: stats?.offerStats?.inactiveOffers || 0 }
          ]}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => [`${value} offres`, 'Nombre']} />
          <Legend />
          <Bar dataKey="value" fill="#4e79a7" />
        </BarChart>
      )
    },
    {
      title: "Évolution des offres dans le temps",
      description: "Nombre d'offres créées par jour",
      chart: (
        <LineChart data={offersChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" angle={-45} textAnchor="end" interval={0} height={80} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="count" stroke="#4e79a7" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      )
    }
  ];

  if (loading) return <div className="text-center p-5">Chargement...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid p-2 p-md-4 bg-light">
      <div className="row g-3">
        {charts.map((item, i) => (
          <div className="col-12 col-lg-6" key={i}>
            <div className="card shadow-sm mb-3">
              <div className="card-body">
                <h5>{item.title}</h5>
                <p className="text-muted">{item.description}</p>
                <ResponsiveContainer width="100%" height={300}>
                  {item.chart}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">Filtres</h5>
          <div className="row g-2">
            <div className="col-md-3">
              <select className="form-select" name="type" value={filters.type} onChange={handleFilterChange}>
                <option value="">Tous les types</option>
                {uniqueTypes.map((type, idx) => (
                  <option key={idx} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" name="location" value={filters.location} onChange={handleFilterChange}>
                <option value="">Toutes les localisations</option>
                {uniqueLocations.map((loc, idx) => (
                  <option key={idx} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <select className="form-select" name="active" value={filters.active} onChange={handleFilterChange}>
                <option value="">Tous les statuts</option>
                <option value="true">Actives</option>
                <option value="false">Inactives</option>
              </select>
            </div>
            <div className="col-md-3">
              <select className="form-select" name="companyName" value={filters.companyName} onChange={handleFilterChange}>
                <option value="">Toutes les entreprises</option>
                {uniqueCompanies.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="col-md-1">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({ type: '', location: '', active: '', companyName: '', sortDate: filters.sortDate })}
              >
                ✖
              </button>
            </div>
          </div>

          <div className="mt-3">
            <label className="form-label">Trier par date :</label>
            <select className="form-select w-auto d-inline-block ms-2" name="sortDate" value={filters.sortDate} onChange={handleFilterChange}>
              <option value="desc">+ Récentes</option>
              <option value="asc">+ Anciennes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau des offres */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">Toutes les offres ({filteredOffers.length})</h5>
          {filteredOffers.length === 0 ? (
            <p className="text-muted">Aucune offre trouvée.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Titre</th>
                    <th>Entreprise</th>
                    <th>Type</th>
                    <th>Lieu</th>
                    <th>Statut</th>
                    <th>Date de création</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOffers.map((offer) => (
                    <tr key={offer.id}>
                      <td>{offer.title}</td>
                      <td>{offer.companyName}</td>
                      <td>{offer.type}</td>
                      <td>{offer.location}</td>
                      <td>
                        <span className={`badge ${offer.active ? 'bg-success' : 'bg-secondary'}`}>
                          {offer.active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(offer.createdAt).toLocaleDateString('fr-FR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Offresadmin;
