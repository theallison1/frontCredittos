import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const CargaDeudores = () => {
    const [nombreDeudor, setNombreDeudor] = useState('');
    const [montoInicial, setMontoInicial] = useState(0);
    const [montoCuotaSemanal, setMontoCuotaSemanal] = useState(0);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaUltimoPago, setFechaUltimoPago] = useState('');
    const [fechaProximoPago, setFechaProximoPago] = useState(''); // Nuevo campo
    const [montoPendiente, setMontoPendiente] = useState(0);
    const [cobrado, setCobrado] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const deudor = {
            nombreDeudor,
            montoInicial,
            montoCuotaSemanal,
            fechaInicio,
            fechaUltimoPago,
            fechaProximoPago, // Nuevo campo
            montoPendiente,
            cobrado,
        };
        try {
            const response = await axios.post('http://localhost:8080/api/deudores', deudor, {
                auth: {
                    username: 'user',
                    password: 'password',
                },
            });
            if (response.status === 200) {
                alert('Deudor guardado exitosamente');
                navigate('/lista-deudores');
            }
        } catch (err) {
            console.error("Error al guardar el deudor:", err);
            alert('Error al guardar el deudor');
        }
    };

    return (
        <div className="card">
            <div className="card-body">
                <h2 className="card-title">Cargar datos del deudor</h2>
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
        </div>
    );
};

export default CargaDeudores;