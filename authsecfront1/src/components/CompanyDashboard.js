import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    PieChart, Pie, BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, Cell, Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ClockHistory, Briefcase, PersonCheck, FileEarmarkText } from 'react-bootstrap-icons';

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

const ActivityIcon = ({ type }) => {
    switch(type) {
        case 'OFFER_CREATED':
            return <Briefcase className="text-primary" size={20} />;
        case 'APPLICATION_RECEIVED':
            return <FileEarmarkText className="text-success" size={20} />;
        case 'APPLICATION_STATUS_CHANGED':
            return <PersonCheck className="text-warning" size={20} />;
        default:
            return <ClockHistory className="text-secondary" size={20} />;
    }
};

const ActivityItem = ({ activity }) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="d-flex align-items-start mb-3">
            <div className="me-3 mt-1">
                <ActivityIcon type={activity.activityType} />
            </div>
            <div className="flex-grow-1">
                <div className="d-flex justify-content-between">
                    <strong className="text-dark">{activity.description}</strong>
                    <small className="text-muted">{formatDate(activity.timestamp)}</small>
                </div>
                <div className="small text-muted">
                    {activity.activityType === 'OFFER_CREATED' ? 'Nouvelle offre' :
                        activity.activityType === 'APPLICATION_RECEIVED' ? 'Nouvelle candidature' :
                            'Changement de statut'}
                </div>
            </div>
        </div>
    );
};

const CompanyDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const parseJwt = (token) => {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    };

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('accessToken');

            if (!token) {
                setError('Veuillez vous connecter pour accéder au tableau de bord');
                setLoading(false);
                return;
            }

            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };

            // 1. D'abord récupérer le profil de l'entreprise
            const companyResponse = await axios.get(
                `http://localhost:1217/api/v1/companies/profile/details`,
                config
            );

            const companyId = companyResponse.data.id;
            console.log('Company ID:', companyId);

            if (!companyId) {
                throw new Error('ID entreprise non trouvé');
            }

            // 2. Ensuite récupérer les stats du dashboard
            const dashboardResponse = await axios.get(
                `http://localhost:1217/api/dashboard/company/${companyId}`,
                config
            );

            console.log('Dashboard API Response:', dashboardResponse.data);

            // Normalize data
            const normalizedData = {
                totalOffers: dashboardResponse.data.totalOffers || 0,
                activeOffers: dashboardResponse.data.activeOffers || 0,
                totalApplications: dashboardResponse.data.totalApplications || 0,
                pendingApplications: dashboardResponse.data.pendingApplications || 0,
                acceptedApplications: dashboardResponse.data.acceptedApplications || 0,
                rejectedApplications: dashboardResponse.data.rejectedApplications || 0,
                acceptanceRate: dashboardResponse.data.acceptanceRate || 0,
                totalFavorites: dashboardResponse.data.totalFavorites || 0,
                topOffers: dashboardResponse.data.topOffers || [],
                applicationsByStatus: dashboardResponse.data.applicationsByStatus || {},
                offersByType: dashboardResponse.data.offersByType || {},
                applicationsOverTime: dashboardResponse.data.applicationsOverTime || {},
                candidatesByField: dashboardResponse.data.candidatesByField || {},
                recentActivities: dashboardResponse.data.recentActivities || []
            };

            setStats(normalizedData);
        } catch (err) {
            console.error('Error:', {
                message: err.message,
                response: err.response?.data,
                config: err.config
            });

            if (err.response?.status === 404) {
                if (err.config.url.includes('/api/dashboard/company/')) {
                    setStats({
                        totalOffers: 0,
                        activeOffers: 0,
                        totalApplications: 0,
                        pendingApplications: 0,
                        acceptedApplications: 0,
                        rejectedApplications: 0,
                        acceptanceRate: 0.0,
                        totalFavorites: 0,
                        topOffers: [],
                        applicationsByStatus: {},
                        offersByType: {},
                        applicationsOverTime: {},
                        candidatesByField: {},
                        recentActivities: []
                    });
                } else {
                    setError("Profil entreprise non trouvé");
                }
            } else {
                setError(err.response?.data?.message || err.message || 'Erreur de chargement');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleLoginRedirect = () => {
        window.location.href = '/login';
    };

    const handleReload = () => {
        window.location.reload();
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
                    onClick={error.includes('connecter') ? handleLoginRedirect : handleReload}
                >
                    {error.includes('connecter') ? 'Se connecter' : 'Réessayer'}
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
                    onClick={handleReload}
                >
                    Actualiser
                </button>
            </div>
        );
    }

    // Prepare chart data with empty state handling
    const statusData = stats.applicationsByStatus && Object.keys(stats.applicationsByStatus).length > 0
        ? Object.entries(stats.applicationsByStatus).map(([name, value]) => ({
            name,
            value
        }))
        : [];

    const offerTypeData = stats.offersByType && Object.keys(stats.offersByType).length > 0
        ? Object.entries(stats.offersByType).map(([name, value]) => ({
            name,
            value
        }))
        : [];

    const fieldData = stats.candidatesByField && Object.keys(stats.candidatesByField).length > 0
        ? Object.entries(stats.candidatesByField)
            .map(([field, count]) => ({
                subject: field,
                A: count,
                fullMark: Math.max(...Object.values(stats.candidatesByField)) * 1.2
            }))
            .sort((a, b) => b.A - a.A)
            .slice(0, 5)
        : [];

    // Charts configuration with empty state handling
    const charts = [
        {
            title: "Candidatures par statut",
            description: "Répartition des candidatures selon leur statut",
            chart: statusData.length > 0 ? (
                <PieChart>
                    <Pie
                        data={statusData}
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
                        {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} candidatures`, 'Nombre']} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
            ) : <EmptyDataPlaceholder message="Aucune donnée de candidature disponible" />
        },
        {
            title: "Types d'offres",
            description: "Répartition des offres par type",
            chart: offerTypeData.length > 0 ? (
                <PieChart>
                    <Pie
                        data={offerTypeData}
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
                        {offerTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} offres`, 'Nombre']} />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
            ) : <EmptyDataPlaceholder message="Aucune donnée d'offre disponible" />
        },
        {
            title: "Top 5 des offres",
            description: "Classement par nombre de candidatures",
            chart: stats.topOffers.length > 0 ? (
                <BarChart data={stats.topOffers} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="title" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => [`${value} candidatures`, 'Nombre']} />
                    <Legend />
                    <Bar dataKey="applicationCount" name="Candidatures" radius={[4, 4, 0, 0]} fill="#4e79a7" />
                </BarChart>
            ) : <EmptyDataPlaceholder message="Aucune donnée d'offre populaire disponible" />
        },
        {
            title: "Domaines d'étude des candidats",
            description: "Top 5 des domaines de formation des candidats",
            chart: fieldData.length > 0 ? (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={fieldData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax + 10']} />
                    <Radar
                        name="Candidats"
                        dataKey="A"
                        stroke="#4e79a7"
                        fill="#4e79a7"
                        fillOpacity={0.6}
                    />
                    <Legend />
                    <Tooltip
                        formatter={(value) => [`${value} candidats`, 'Nombre']}
                        labelFormatter={(value) => `Domaine: ${value}`}
                    />
                </RadarChart>
            ) : <EmptyDataPlaceholder message="Aucune donnée de domaine d'étude disponible" />
        }
    ];

    return (
        <div className="container-fluid p-2 p-md-4 bg-light">
            {/* Header */}
            <div className="card border-0 mb-4" style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ed 100%)',
                border: '1px solid rgba(0, 0, 0, 0.12)'
            }}>
                <div className="card-body p-3 p-md-4">
                    <h1 className="fw-bold mb-3" style={{ color: '#4e79a7' }}>Tableau de bord de l'entreprise</h1>
                    <p className="text-muted mb-0" style={{ maxWidth: '800px' }}>
                        Analyse des performances de vos offres d'emploi et des candidatures reçues.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 p-3 bg-white rounded-3 shadow-sm">
                {[
                    { label: 'Offres totales', value: stats.totalOffers },
                    { label: 'Offres actives', value: stats.activeOffers },
                    { label: 'Candidatures totales', value: stats.totalApplications },
                    { label: 'Favoris totaux', value: stats.totalFavorites },
                    { label: 'Taux d\'acceptation', value: `${stats.acceptanceRate.toFixed(1)}%` }
                ].map((stat, index) => (
                    <div key={index} className="text-center px-3 py-2">
                        <div className="text-muted small fw-medium">{stat.label}</div>
                        <div className="fw-bold fs-3" style={{ color: '#4e79a7' }}>{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts and Activities */}
            <div className="row g-3">
                {charts.map((item, index) => (
                    <div key={index} className={`col-12 ${index === 3 ? 'col-lg-6' : 'col-lg-4'} mb-3`}>
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

                {/* Activités récentes */}
                <div className="col-12 col-lg-6 mb-3">
                    <div className="card shadow-sm h-100 rounded-3 border-0">
                        <div className="card-body p-3">
                            <h5 className="fw-bold mb-2" style={{ color: '#4e79a7' }}>Activités récentes</h5>
                            <p className="text-muted small mb-3">Dernières actions sur votre compte</p>
                            <div style={{ height: '300px', overflowY: 'auto' }}>
                                {stats.recentActivities && stats.recentActivities.length > 0 ? (
                                    <div className="activity-list">
                                        {stats.recentActivities.map((activity, index) => (
                                            <ActivityItem key={index} activity={activity} />
                                        ))}
                                    </div>
                                ) : (
                                    <EmptyDataPlaceholder message="Aucune activité récente" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDashboard;