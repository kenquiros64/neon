/**
 * Error Handling System for Route Operations
 * 
 * This module provides a comprehensive error handling system for route-related operations
 * in the application. It includes:
 * 
 * 1. Predefined error messages in Spanish for common route errors
 * 2. Smart error message mapping based on error types
 * 3. User-friendly error categorization
 * 
 * Usage Examples:
 * 
 * ```typescript
 * // In components:
 * import { getRouteErrorMessage, routeErrorMessages } from '../util/ErrorMessages';
 * 
 * // Handle specific errors:
 * catch (error) {
 *   const userFriendlyMessage = getRouteErrorMessage(error);
 *   toast.error(userFriendlyMessage);
 * }
 * 
 * // Use predefined messages:
 * if (routes.length === 0) {
 *   toast.warning(routeErrorMessages.NO_ROUTES_FOUND);
 * }
 * ```
 * 
 * Error Categories:
 * - NETWORK_ERROR: Connection issues, fetch failures
 * - DATABASE_ERROR: Local/remote database problems  
 * - NO_ROUTES_FOUND: Empty results (not an error, but informational)
 * - SYNC_ERROR: Issues synchronizing with remote server
 * - PERMISSION_ERROR: Authorization/authentication problems
 * - TIMEOUT_ERROR: Request timeouts
 * - UNKNOWN_ERROR: Fallback for unrecognized errors
 */

export const loginErrorMessages: Record<string, string> = {
    USER_NOT_FOUND: "Usuario no encontrado",
    USER_INVALID_PASSWORD: "Contraseña incorrecta"
};

export const routeErrorMessages: Record<string, string> = {
    NETWORK_ERROR: "Error de conexión. Verifique su conexión a internet",
    DATABASE_ERROR: "Error en la base de datos. Intente nuevamente",
    NO_ROUTES_FOUND: "No se encontraron rutas disponibles",
    SYNC_ERROR: "Error al sincronizar rutas con el servidor",
    PERMISSION_ERROR: "No tiene permisos para acceder a las rutas",
    TIMEOUT_ERROR: "Tiempo de espera agotado. Intente nuevamente",
    UNKNOWN_ERROR: "Error desconocido al cargar rutas"
};

export const getRouteErrorMessage = (error: any): string => {
    if (typeof error === 'string') {
        return routeErrorMessages[error] || error;
    }
    
    if (error?.message) {
        // Check for common error patterns
        if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
            return routeErrorMessages.NETWORK_ERROR;
        }
        if (error.message.toLowerCase().includes('timeout')) {
            return routeErrorMessages.TIMEOUT_ERROR;
        }
        if (error.message.toLowerCase().includes('database')) {
            return routeErrorMessages.DATABASE_ERROR;
        }
        if (error.message.toLowerCase().includes('permission')) {
            return routeErrorMessages.PERMISSION_ERROR;
        }
        
        return error.message;
    }
    
    return routeErrorMessages.UNKNOWN_ERROR;
};