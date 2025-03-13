import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isTokenExpired, logout } from '../auth'; // Importar funciones de autenticación
import Modal from 'react-bootstrap/Modal'; // Importar el modal de Bootstrap
import Button from 'react-bootstrap/Button'; // Importar el botón de Bootstrap

const CargaDeudores = () => {
    const [nombreDeudor, setNombreDeudor] = useState('');
    const [direccion, setDireccion] = useState(''); // Nuevo estado para la dirección
    const [montoInicial, setMontoInicial] = useState(0);
    const [montoCuotaSemanal, setMontoCuotaSemanal] = useState(0);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaUltimoPago, setFechaUltimoPago] = useState('');
    const [fechaProximoPago, setFechaProximoPago] = useState('');
    const [montoPendiente, setMontoPendiente] = useState(0);
    const [cobrado, setCobrado] = useState(false);
    const [error, setError] = useState('');
    const [showInactivityModal, setShowInactivityModal] = useState(false); // Estado para mostrar el modal de inactividad
    const navigate = useNavigate();

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores anteriores

        // Verificar si el token ha caducado
        const token = localStorage.getItem('token');
        if (!token || isTokenExpired(token)) {
            alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'); // Usar alert en lugar de console.log
            handleLogout();
            return;
        }

        const deudor = {
            nombreDeudor,
            direccion, // Nuevo campo
            montoInicial,
            montoCuotaSemanal,
            fechaInicio,
            fechaUltimoPago,
            fechaProximoPago,
            montoPendiente,
            cobrado,
        };

        try {
            // Realizar la solicitud POST al endpoint de deudores
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/deudores`, deudor, {
                headers: {
                    Authorization: `Bearer ${token}`, // Enviar el token en el encabezado
                },
            });

            if (response.status === 200) {
                alert('Deudor guardado exitosamente');
                navigate('/lista-deudores'); // Redirigir a la lista de deudores
            }
        } catch (err) {
            // Manejar errores
            if (err.response && err.response.status === 401) {
                alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'); // Usar alert en lugar de console.log
                handleLogout();
            } else {
                alert(err.response?.data?.message || 'Error de conexión. Inténtalo de nuevo más tarde.'); // Usar alert en lugar de console.log
            }
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Cargar datos del deudor</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="nombreDeudor" className="form-label">Nombre del deudor</label>
                        <input
                            type="text"
                            className="form-control"
                            id="nombreDeudor"
                            placeholder="Nombre del deudor"
                            value={nombreDeudor}
                            onChange={(e) => setNombreDeudor(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="direccion" className="form-label">Dirección</label>
                        <input
                            type="text"
                            className="form-control"
                            id="direccion"
                            placeholder="Dirección"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="montoInicial" className="form-label">Monto inicial</label>
                        <input
                            type="number"
                            className="form-control"
                            id="montoInicial"
                            placeholder="Monto inicial"
                            value={montoInicial}
                            onChange={(e) => setMontoInicial(parseFloat(e.target.value))}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="montoCuotaSemanal" className="form-label">Monto de la cuota semanal</label>
                        <input
                            type="number"
                            className="form-control"
                            id="montoCuotaSemanal"
                            placeholder="Monto de la cuota semanal"
                            value={montoCuotaSemanal}
                            onChange={(e) => setMontoCuotaSemanal(parseFloat(e.target.value))}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fechaInicio" className="form-label">Fecha de inicio</label>
                        <input
                            type="date"
                            className="form-control"
                            id="fechaInicio"
                            placeholder="Fecha de inicio"
                            value={fechaInicio}
                            onChange={(e) => setFechaInicio(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fechaUltimoPago" className="form-label">Fecha del último pago</label>
                        <input
                            type="date"
                            className="form-control"
                            id="fechaUltimoPago"
                            placeholder="Fecha del último pago"
                            value={fechaUltimoPago}
                            onChange={(e) => setFechaUltimoPago(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="fechaProximoPago" className="form-label">Fecha próximo pago</label>
                        <input
                            type="date"
                            className="form-control"
                            id="fechaProximoPago"
                            placeholder="Fecha próximo pago"
                            value={fechaProximoPago}
                            onChange={(e) => setFechaProximoPago(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="montoPendiente" className="form-label">Monto pendiente</label>
                        <input
                            type="number"
                            className="form-control"
                            id="montoPendiente"
                            placeholder="Monto pendiente"
                            value={montoPendiente}
                            onChange={(e) => setMontoPendiente(parseFloat(e.target.value))}
                            required
                        />
                    </div>
                    <div className="mb-3 form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            id="cobrado"
                            checked={cobrado}
                            onChange={(e) => setCobrado(e.target.checked)}
                        />
                        <label htmlFor="cobrado" className="form-check-label">Cobrado</label>
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Guardar</button>
                </form>
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

export default CargaDeudores;