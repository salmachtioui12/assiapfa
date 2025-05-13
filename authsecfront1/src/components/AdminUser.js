import React, { useState } from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

import UserList from './UserList';

const AdminOffre = ({ handleLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const getLinkClass = (path) => {
        return location.pathname === path ? 'text-dark fw-bold' : 'text-secondary';
    };

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ backgroundColor: '#f4f6f8' }}>
            {/* Navbar */}
            <Navbar bg="white" expand="lg" className="shadow-sm px-4 py-3">
                <Container fluid>
                    <Navbar.Brand href="#" className="fw-bold text-teal">
                    E-InterMatch
                    </Navbar.Brand>
                    <Navbar.Toggle />
                    <Navbar.Collapse>
                        <Nav className="me-auto">
                            <Nav.Link
                                onClick={() => navigate('/admin/dashboard')}
                                className={getLinkClass('/admin/dashboard')}
                            >
                                Dashboard
                            </Nav.Link>
                            <Nav.Link
                                onClick={() => navigate('/admin/users')}
                                className={getLinkClass('/admin/users')}
                            >
                                Utilisateurs
                            </Nav.Link>
                            <Nav.Link
                                onClick={() => navigate('/admin/companies')}
                                className={getLinkClass('/admin/companies')}
                            >
                                Entreprises
                            </Nav.Link>
                            <Nav.Link
                                onClick={() => navigate('/admin/offers')}
                                className={getLinkClass('/admin/offers')}
                            >
                                Offres
                            </Nav.Link>
                             <Nav.Link
                                                            onClick={() => navigate('/admin/candidature')}
                                                            className={getLinkClass('/admin/candidature')}
                                                        >
                                                            Candidature
                                                        </Nav.Link>
                        </Nav>
                        <Button
                            variant="light"
                            onClick={handleLogout}
                            className="ms-2 border rounded-pill px-3 py-2 text-dark shadow-sm"
                        >
                            <i className="fas fa-sign-out-alt me-1"></i> Déconnexion
                        </Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Contenu principal */}
            <main className="flex-grow-1 p-4">
                <Container fluid>
                    <div className="bg-white rounded-4 shadow-sm p-4">
                        <UserList />
                        
                    </div>
                </Container>
            </main>
        </div>
    );
};

export default AdminOffre;
