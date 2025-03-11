import React, { useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const FormularioDeudor = () => {
    const [nombreDeudor, setNombreDeudor] = useState('');
    const [montoInicial, setMontoInicial] = useState(0);
    const [montoCuotaSemanal, setMontoCuotaSemanal] = useState(0);
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaUltimoPago, setFechaUltimoPago] = useState('');
    const [montoPendiente, setMontoPendiente] = useState(0);
    const [cobrado, setCobrado] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores anteriores

        const deudor = {
            nombreDeudor,
            montoInicial,
            montoCuotaSemanal,
            fechaInicio,
            fechaUltimoPago,
            montoPendiente,
            cobrado,
        };

        try {
            // Obtener el token JWT del localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No estás autenticado. Por favor, inicia sesión.');
                return;
            }

            // Realizar la solicitud POST al endpoint de deudores
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/deudores`, deudor, {
                headers: {
                    Authorization: `Bearer ${token}`, // Enviar el token en el encabezado
                },
            });

            if (response.status === 200) {
                alert('Deudor guardado exitosamente');
                // Limpiar el formulario después de guardar
                setNombreDeudor('');
                setMontoInicial(0);
                setMontoCuotaSemanal(0);
                setFechaInicio('');
                setFechaUltimoPago('');
                setMontoPendiente(0);
                setCobrado(false);
            }
        } catch (err) {
            // Manejar errores
            if (err.response) {
                setError(err.response.data.message || 'Error al guardar el deudor');
            } else {
                setError('Error de conexión. Inténtalo de nuevo más tarde.');
            }
            console.error("Error al guardar el deudor:", err);
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
        </div>
    );
};

export default FormularioDeudor;