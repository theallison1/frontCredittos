import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores anteriores

        try {
            // Realizar la solicitud POST al endpoint de login
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/auth/login`, // Usar la URL del backend desde .env
                {
                    username: username,
                    password: password,
                }
            );

            // Si el login es exitoso, obtener el token JWT
            const token = response.data; // El backend devuelve el token directamente
            localStorage.setItem('token', token); // Guardar el token en localStorage

            onLogin(true); // Notificar que el usuario ha iniciado sesión
            navigate('/home'); // Redirigir al usuario a la página de inicio
        } catch (err) {
            // Manejar errores
            if (err.response) {
                // Error de respuesta del servidor
                setError(err.response.data.message || 'Credenciales incorrectas');
            } else {
                // Error de red o otro tipo de error
                setError('Error de conexión. Inténtalo de nuevo más tarde.');
            }
        }
    };

    return (
        <div className="login-container">
            <h2>Iniciar sesión</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Usuario</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username"
                        placeholder="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary w-100">Iniciar sesión</button>
            </form>
        </div>
    );
};

export default Login;