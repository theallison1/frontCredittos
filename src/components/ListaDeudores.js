import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ListaDeudores = () => {
    const [deudores, setDeudores] = useState([]);
    const [error, setError] = useState('');

    // Obtener la lista de deudores al cargar el componente
    useEffect(() => {
        const fetchDeudores = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No estás autenticado. Por favor, inicia sesión.');
                    return;
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/deudores`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setDeudores(response.data);
            } catch (err) {
                if (err.response) {
                    setError(err.response.data.message || 'Error al obtener los deudores');
                } else {
                    setError('Error de conexión. Inténtalo de nuevo más tarde.');
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
            if (!token) {
                setError('No estás autenticado. Por favor, inicia sesión.');
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
            if (err.response) {
                setError(err.response.data.message || 'Error al pagar la cuota');
            } else {
                setError('Error de conexión. Inténtalo de nuevo más tarde.');
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
        </div>
    );
};

export default ListaDeudores;