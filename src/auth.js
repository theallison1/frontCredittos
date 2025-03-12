// auth.js
export const isTokenExpired = (token) => {
    if (!token) return true; // Si no hay token, está "expirado"
    try {
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica el payload del token
        const exp = payload.exp * 1000; // Convierte a milisegundos
        return Date.now() > exp; // True si el token expiró
    } catch (error) {
        return true; // Si hay un error al decodificar, considera el token como expirado
    }
};

export const logout = () => {
    localStorage.removeItem('token'); // Eliminar el token
    window.location.href = '/'; // Redirigir al login
};