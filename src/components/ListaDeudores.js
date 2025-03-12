import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isTokenExpired, logout } from '../auth'; // Importar funciones de autenticación
import Modal from 'react-bootstrap/Modal'; // Importar el modal de Bootstrap
import Button from 'react-bootstrap/Button'; // Importar el botón de Bootstrap

const ListaDeudores = () => {
    const [deudores, setDeudores] = useState([]);
    const [error, setError] = useState('');
    const [showInactivityModal, setShowInactivityModal] = useState(false); // Estado para mostrar el modal de inactividad

    // Temporizador para detectar inactividad
    let inactivityTimer;
    let inactivityConfirmationTimer;

    // Función para reiniciar el temporizador de inactividad
    const resetInactivityTimer = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        if (inactivityConfirmationTimer) clearTimeout(inactivityConfirmationTimer);

        // Configurar el temporizador de inactividad (5 minutos)
        inactivityTimer = setTimeout(() => {
            setShowInactivityModal(true); // Mostrar el modal de confirmación

            // Configurar el temporizador de cierre automático (3 segundos)
            inactivityConfirmationTimer = setTimeout(() => {
                handleLogout(); // Cerrar sesión automáticamente
            }, 3000); // 3 segundos
        }, 5 * 60 * 1000); // 5 minutos
    };

    // Verificar la inactividad al cargar el componente y con la interacción del usuario
    useEffect(() => {
        resetInactivityTimer(); // Iniciar el temporizador al cargar el componente

        // Agregar event listeners para detectar interacción del usuario
        window.addEventListener('mousemove', resetInactivityTimer);
        window.addEventListener('keydown', resetInactivityTimer);
        window.addEventListener('click', resetInactivityTimer);

        // Limpiar event listeners al desmontar el componente
        return () => {
            window.removeEventListener('mousemove', resetInactivityTimer);
            window.removeEventListener('keydown', resetInactivityTimer);
            window.removeEventListener('click', resetInactivityTimer);
            if (inactivityTimer) clearTimeout(inactivityTimer);
            if (inactivityConfirmationTimer) clearTimeout(inactivityConfirmationTimer);
        };
    }, []);

    const handleLogout = () => {
        logout(); // Cerrar sesión
        setShowInactivityModal(false); // Ocultar el modal
    };

    const handleContinueSession = () => {
        setShowInactivityModal(false); // Ocultar el modal
        resetInactivityTimer(); // Reiniciar el temporizador
    };

    // Obtener la lista de deudores al cargar el componente
    useEffect(() => {
        const fetchDeudores = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token || isTokenExpired(token)) {
                    setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    handleLogout();
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/deudores`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setDeudores(response.data);
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    handleLogout();
                } else {
                    setError(err.response?.data?.message || 'Error de conexión. Inténtalo de nuevo más tarde.');
                }
                console.error("Error al obtener los deudores:", err);
            }
        };

        fetchDeudores();
    }, []);

    // Manejar el pago de una cuota
    const handlePagarCuota = async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token || isTokenExpired(token)) {
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                handleLogout();
                return;
            }

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/deudores/${id}/pagar-cuota`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 200) {
                // Actualizar la lista de deudores
                const updatedDeudores = deudores.map((deudor) =>
                    deudor.id === id ? response.data : deudor
                );
                setDeudores(updatedDeudores);

                // Mostrar un mensaje de éxito
                alert('Cuota pagada exitosamente');
            }
        } catch (err) {
            if (err.response && err.response.status === 401) {
                setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                handleLogout();
            } else {
                setError(err.response?.data?.message || 'Error de conexión. Inténtalo de nuevo más tarde.');
            }
            console.error("Error al pagar la cuota:", err);
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Lista de deudores</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Monto inicial</th>
                                <th>Cuota semanal</th>
                                <th>Fecha de inicio</th>
                                <th>Último pago</th>
                                <th>Próximo pago</th>
                                <th>Monto pendiente</th>
                                <th>Cobrado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deudores.map((deudor) => (
                                <tr key={deudor.id}>
                                    <td>{deudor.nombreDeudor}</td>
                                    <td>${deudor.montoInicial.toFixed(2)}</td>
                                    <td>${deudor.montoCuotaSemanal.toFixed(2)}</td>
                                    <td>{new Date(deudor.fechaInicio).toLocaleDateString()}</td>
                                    <td>{new Date(deudor.fechaUltimoPago).toLocaleDateString()}</td>
                                    <td>{new Date(deudor.fechaProximoPago).toLocaleDateString()}</td>
                                    <td>${deudor.montoPendiente.toFixed(2)}</td>
                                    <td>{deudor.cobrado ? "Sí" : "No"}</td>
                                    <td>
                                        {deudor.cobrado || deudor.montoPendiente <= 0 ? (
                                            <span className="text-success">Cobrado</span>
                                        ) : (
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => handlePagarCuota(deudor.id)}
                                                disabled={deudor.montoPendiente <= 0 || deudor.cobrado}
                                            >
                                                Pagar Cuota
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de confirmación de inactividad */}
            <Modal show={showInactivityModal} onHide={handleContinueSession}>
                <Modal.Header closeButton>
                    <Modal.Title>¿Sigues ahí?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Tu sesión está a punto de cerrarse debido a inactividad. ¿Deseas continuar navegando?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleLogout}>
                        Cerrar sesión
                    </Button>
                    <Button variant="primary" onClick={handleContinueSession}>
                        Continuar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ListaDeudores;