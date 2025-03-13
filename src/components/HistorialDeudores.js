import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { isTokenExpired, logout } from '../auth'; // Importar funciones de autenticación
import Modal from 'react-bootstrap/Modal'; // Importar el modal de Bootstrap
import Button from 'react-bootstrap/Button'; // Importar el botón de Bootstrap
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'; // Gráficos
import { CSVLink } from 'react-csv'; // Exportar a CSV

const HistorialDeudores = () => {
    const [deudores, setDeudores] = useState([]); // Lista completa de deudores (inicializada como array vacío)
    const [filtroEstado, setFiltroEstado] = useState('todos'); // Filtro por estado (activos, no activos, todos)
    const [filtroNombre, setFiltroNombre] = useState(''); // Filtro por nombre
    const [filtroFecha, setFiltroFecha] = useState(null); // Filtro por fecha
    const [filtroMonto, setFiltroMonto] = useState({ min: 0, max: Number.MAX_SAFE_INTEGER }); // Filtro por monto pendiente
    const [error, setError] = useState('');
    const [showHistorialModal, setShowHistorialModal] = useState(false); // Modal para ver el historial de pagos
    const [selectedDeudorHistorial, setSelectedDeudorHistorial] = useState(null); // Deudor seleccionado para ver el historial
    const navigate = useNavigate();

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

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/deudores/historial`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                // Verificar que la respuesta sea un array
                if (Array.isArray(response.data)) {
                    setDeudores(response.data); // Guardar la lista completa de deudores
                } else {
                    setError('La respuesta de la API no es válida.');
                    setDeudores([]); // Establecer un array vacío como valor por defecto
                }
            } catch (err) {
                setError(err.response?.data?.message || 'Error de conexión. Inténtalo de nuevo más tarde.');
                setDeudores([]); // Establecer un array vacío en caso de error
            }
        };

        fetchDeudores();
    }, []);

    // Filtrar deudores
    const filteredDeudores = Array.isArray(deudores) ? deudores.filter((deudor) => {
        if (!deudor) return false; // Evitar errores si deudor es null o undefined

        const cumpleEstado = filtroEstado === 'todos' ||
                            (filtroEstado === 'activos' && deudor.montoPendiente > 0) ||
                            (filtroEstado === 'no-activos' && deudor.montoPendiente <= 0);

        const cumpleNombre = deudor.nombreDeudor?.toLowerCase().includes(filtroNombre.toLowerCase());

        const cumpleFecha = !filtroFecha || (deudor.fechaInicio && new Date(deudor.fechaInicio) <= new Date(filtroFecha);

        const cumpleMonto = deudor.montoPendiente >= filtroMonto.min && deudor.montoPendiente <= filtroMonto.max;

        return cumpleEstado && cumpleNombre && cumpleFecha && cumpleMonto;
    }) : [];

    // Datos para el gráfico
    const datosGrafico = [
        { name: 'Activos', value: deudores.filter((d) => d.montoPendiente > 0).length },
        { name: 'No activos', value: deudores.filter((d) => d.montoPendiente <= 0).length },
    ];

    // Exportar a CSV
    const csvData = filteredDeudores.map((deudor) => ({
        Nombre: deudor.nombreDeudor,
        'Monto inicial': deudor.montoInicial,
        'Monto pendiente': deudor.montoPendiente,
        'Fecha de inicio': new Date(deudor.fechaInicio).toLocaleDateString(),
        'Último pago': new Date(deudor.fechaUltimoPago).toLocaleDateString(),
        'Próximo pago': new Date(deudor.fechaProximoPago).toLocaleDateString(),
        Estado: deudor.montoPendiente > 0 ? 'Activo' : 'No activo',
    }));

    // Ver historial de pagos de un deudor
    const handleVerHistorial = (deudor) => {
        setSelectedDeudorHistorial(deudor);
        setShowHistorialModal(true);
    };

    // Cerrar sesión
    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Historial de deudores</h2>

                {/* Filtros */}
                <div className="mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre..."
                        value={filtroNombre}
                        onChange={(e) => setFiltroNombre(e.target.value)}
                    />
                    <select
                        className="form-control mt-2"
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                    >
                        <option value="todos">Todos</option>
                        <option value="activos">Activos</option>
                        <option value="no-activos">No activos</option>
                    </select>
                    <input
                        type="date"
                        className="form-control mt-2"
                        value={filtroFecha || ''}
                        onChange={(e) => setFiltroFecha(e.target.value)}
                    />
                    <input
                        type="number"
                        className="form-control mt-2"
                        placeholder="Monto mínimo"
                        value={filtroMonto.min}
                        onChange={(e) => setFiltroMonto({ ...filtroMonto, min: parseFloat(e.target.value) || 0 })}
                    />
                    <input
                        type="number"
                        className="form-control mt-2"
                        placeholder="Monto máximo"
                        value={filtroMonto.max === Number.MAX_SAFE_INTEGER ? '' : filtroMonto.max} // Mostrar vacío si no hay límite
                        onChange={(e) => setFiltroMonto({ ...filtroMonto, max: parseFloat(e.target.value) || Infinity })}
                    />
                </div>

                {/* Exportar a CSV */}
                <CSVLink data={csvData} filename="historial_deudores.csv" className="btn btn-success mb-3">
                    Exportar a CSV
                </CSVLink>

                {/* Gráfico */}
                <BarChart width={500} height={300} data={datosGrafico}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                </BarChart>

                {error && <div className="alert alert-danger">{error}</div>}

                {/* Tabla de deudores */}
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Monto inicial</th>
                                <th>Monto pendiente</th>
                                <th>Fecha de inicio</th>
                                <th>Último pago</th>
                                <th>Próximo pago</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDeudores.map((deudor) => (
                                <tr key={deudor.id}>
                                    <td>{deudor.nombreDeudor}</td>
                                    <td>${deudor.montoInicial.toFixed(2)}</td>
                                    <td>${deudor.montoPendiente.toFixed(2)}</td>
                                    <td>{new Date(deudor.fechaInicio).toLocaleDateString()}</td>
                                    <td>{new Date(deudor.fechaUltimoPago).toLocaleDateString()}</td>
                                    <td>{new Date(deudor.fechaProximoPago).toLocaleDateString()}</td>
                                    <td>{deudor.montoPendiente > 0 ? 'Activo' : 'No activo'}</td>
                                    <td>
                                        <button
                                            className="btn btn-info btn-sm"
                                            onClick={() => handleVerHistorial(deudor)}
                                        >
                                            Ver historial
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal para ver el historial de pagos */}
            <Modal show={showHistorialModal} onHide={() => setShowHistorialModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Historial de pagos de {selectedDeudorHistorial?.nombreDeudor}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul>
                        {selectedDeudorHistorial?.historialPagos?.map((pago, index) => (
                            <li key={index}>
                                Fecha: {new Date(pago.fecha).toLocaleDateString()} - Monto: ${pago.monto.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHistorialModal(false)}>
                        Cerrar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default HistorialDeudores;