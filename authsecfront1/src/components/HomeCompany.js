import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationDropdown from '../components/NotificationDropdown';
import CompanyDashboard from './CompanyDashboard';
import axios from 'axios';
const HomeCompany = () => {
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const userId = parseInt(localStorage.getItem("userId"));
    const token = localStorage.getItem('accessToken');

    const fetchCompanyProfile = async () => {
        try {
            const response = await axios.get(
                `http://localhost:1217/api/v1/companies/profile/details`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setCompany(response.data);
            return response.data;
        } catch (err) {
            if (err.response?.status === 404) {
                setCompany(null);
            } else if (err.response?.status === 401) {
                localStorage.removeItem('accessToken');
                navigate('/login');
            }
            return null;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                await fetchCompanyProfile();
            } catch (err) {
                console.error('Error:', err);
                setError(err.message || 'Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            loadData();
        } else {
            navigate('/login');
        }
    }, [token, navigate]);

    const handleReload = () => {
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-80 flex-column">
                <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="text-muted">Chargement en cours...</h6>
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
                    onClick={handleReload}
                >
                    Réessayer
                </button>
            </div>
        );
    }

    if (!company) {
        return (
            <div className="container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
                <div className="card border-0 shadow-sm">
                    <div className="card-body text-center p-5">
                        <h2 className="mb-4">Profil Entreprise Requis</h2>
                        <p className="mb-4">
                            Vous devez créer votre profil entreprise avant d'accéder au tableau de bord.
                        </p>
                        <Link
                            to="/company-profile"
                            className="btn btn-primary btn-lg px-4"
                        >
                            Créer mon profil entreprise
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Barre de navigation */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid #eee'
            }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Link to="/company-profile" style={{ textDecoration: 'none', color: '#1976d2' }}>
                        Voir mon profil entreprise
                    </Link>
                    <Link to="/offers" style={{ textDecoration: 'none', color: '#1976d2' }}>
                        Gérer mes Offres
                    </Link>
                </div>

                {userId && <NotificationDropdown userId={userId} />}
            </div>

            {/* Intégration du Dashboard */}
            <CompanyDashboard company={company} />
        </div>
    );
};

export default HomeCompany;