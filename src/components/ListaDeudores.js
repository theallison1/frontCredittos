import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ListaDeudores = () => {
    const [deudores, setDeudores] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDeudores = async () => {
            try {
                // Obtener el token JWT del localStorage
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('No estás autenticado. Por favor, inicia sesión.');
                    return;
                }

                // Realizar la solicitud GET al endpoint de deudores
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/deudores`, {
                    headers: {
                        Authorization: `Bearer ${token}`, // Enviar el token en el encabezado
                    },
                });

                // Actualizar el estado con los datos de los deudores
                setDeudores(response.data);
            } catch (err) {
                // Manejar errores
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
                                <th>Monto pendiente</th>
                                <th>Cobrado</th>
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
                                    <td>${deudor.montoPendiente.toFixed(2)}</td>
                                    <td>{deudor.cobrado ? "Sí" : "No"}</td>
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