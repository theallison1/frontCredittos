import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ListaDeudores = () => {
    const [deudores, setDeudores] = useState([]);

    useEffect(() => {
        const fetchDeudores = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/deudores', {
                    auth: {
                        username: 'user',
                        password: 'password',
                    },
                });
                setDeudores(response.data);
            } catch (err) {
                console.error("Error al obtener los deudores:", err);
            }
        };

        fetchDeudores();
    }, []);

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Lista de deudores</h2>
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