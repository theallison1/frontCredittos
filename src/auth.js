// auth.js

export const isTokenExpired = (token) => {
    if (!token) return true; // Si no hay token, está "expirado"

    try {
        // Verificar que el token tenga el formato correcto (JWT tiene 3 partes separadas por puntos)
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error("Token no válido: no es un JWT válido");
            return true; // Considerar el token como expirado si no es un JWT válido
        }

        // Decodificar el payload del token
        const payload = JSON.parse(atob(parts[1]));

        // Verificar si el token tiene un campo 'exp'
        if (!payload.exp) {
            console.error("Token no válido: no tiene campo 'exp'");
            return true; // Considerar el token como expirado si no tiene campo 'exp'
        }

        // Convertir el campo 'exp' a milisegundos y comparar con la hora actual
        const exp = payload.exp * 1000; // 'exp' está en segundos, convertirlo a milisegundos
        return Date.now() > exp; // True si el token expiró
    } catch (error) {
        console.error("Error al decodificar el token:", error);
        return true; // Si hay un error al decodificar, considerar el token como expirado
    }
};

export const logout = () => {
    // Eliminar el token y cualquier otro dato relacionado con la autenticación
    localStorage.removeItem('token');

    // Redirigir al login
    window.location.href = '/';
};