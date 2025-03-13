import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import 'bootstrap/dist/css/bootstrap.min.css';
import { isTokenExpired, logout } from '../auth'; // Importar funciones de autenticación
import Modal from 'react-bootstrap/Modal'; // Importar el modal de Bootstrap
import Button from 'react-bootstrap/Button'; // Importar el botón de Bootstrap

const ListaDeudores = () => {
    const [deudores, setDeudores] = useState([]); // Lista completa de deudores
    const [filteredDeudores, setFilteredDeudores] = useState([]); // Lista filtrada de deudores
    const [searchTerm, setSearchTerm] = useState(''); // Término de búsqueda
    const [error, setError] = useState('');
    const [showInactivityModal, setShowInactivityModal] = useState(false); // Estado para mostrar el modal de inactividad
    const [showDireccionModal, setShowDireccionModal] = useState(false); // Estado para mostrar el modal de dirección
    const [selectedDeudor, setSelectedDeudor] = useState(null); // Deudor seleccionado para ver la dirección
    const navigate = useNavigate(); // Usar useNavigate

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
        navigate('/'); // Redirigir al login
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

                setDeudores(response.data); // Guardar la lista completa de deudores
                setFilteredDeudores(response.data); // Inicializar la lista filtrada con todos los deudores
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    setError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
                    handleLogout();
                } else {
                    setError(err.response?.data?.message || 'Error de conexión. Inténtalo de nuevo más tarde.');
                }
            }
        };

        fetchDeudores();
    }, []);

    // Filtrar deudores por nombre
    useEffect(() => {
        const filtered = deudores.filter((deudor) =>
            deudor.nombreDeudor.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDeudores(filtered); // Actualizar la lista filtrada
    }, [searchTerm, deudores]);

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
        }
    };

    // Mostrar la dirección en un modal
    const handleShowDireccion = (deudor) => {
        setSelectedDeudor(deudor); // Guardar el deudor seleccionado
        setShowDireccionModal(true); // Mostrar el modal
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Lista de deudores</h2>

                {/* Campo de búsqueda */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

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
                            {filteredDeudores.map((deudor) => (
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
                                        <button
                                            className="btn btn-info btn-sm ms-2"
                                            onClick={() => handleShowDireccion(deudor)}
                                        >
                                            Ver dirección
                                        </button>
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

            {/* Modal para mostrar la dirección */}
            <Modal show={showDireccionModal} onHide={() => setShowDireccionModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Dirección de {selectedDeudor?.nombreDeudor}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{selectedDeudor?.direccion}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDireccionModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ListaDeudores;