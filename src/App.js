import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import CargaDeudores from './components/CargaDeudores';
import ListaDeudores from './components/ListaDeudores';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css'; // Importar estilos personalizados

const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true); // Nuevo estado para manejar la carga inicial
    const navigate = useNavigate();
    const location = useLocation();

    // Verificar si el usuario está autenticado al cargar la aplicación
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
        setIsLoading(false); // Finaliza la carga inicial
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token'); // Eliminar el token al cerrar sesión
        setIsLoggedIn(false);
        navigate('/');
    };

    const showMenu = location.pathname !== '/';

    // Si está cargando, muestra un mensaje de carga (o un spinner)
    if (isLoading) {
        return <div>Cargando...</div>;
    }

    return (
        <>
            {showMenu && (
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <Link to="/home" className="navbar-brand">Gestión de Deudores</Link>
                        <button
                            className="navbar-toggler"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#navbarNav"
                            aria-controls="navbarNav"
                            aria-expanded="false"
                            aria-label="Toggle navigation"
                        >
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav me-auto">
                                <li className="nav-item">
                                    <Link to="/carga-deudores" className="nav-link">Cargar deudor</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/lista-deudores" className="nav-link">Lista de deudores</Link>
                                </li>
                            </ul>
                            {isLoggedIn && (
                                <button className="btn btn-outline-danger" onClick={handleLogout}>
                                    Cerrar sesión
                                </button>
                            )}
                        </div>
                    </div>
                </nav>
            )}
            <div className="container mt-4">
                <Routes>
                    <Route
                        path="/"
                        element={
                            isLoggedIn ? (
                                <Navigate to="/home" replace />
                            ) : (
                                <Login onLogin={(success) => setIsLoggedIn(success)} />
                            )
                        }
                    />
                    <Route
                        path="/home"
                        element={
                            isLoggedIn ? (
                                <Home />
                            ) : (
                                <Navigate to="/" replace />
                            )
                        }
                    />
                    <Route
                        path="/carga-deudores"
                        element={
                            isLoggedIn ? (
                                <CargaDeudores />
                            ) : (
                                <Navigate to="/" replace />
                            )
                        }
                    />
                    <Route
                        path="/lista-deudores"
                        element={
                            isLoggedIn ? (
                                <ListaDeudores />
                            ) : (
                                <Navigate to="/" replace />
                            )
                        }
                    />
                </Routes>
            </div>
        </>
    );
};

export default App;