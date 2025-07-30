import { useEffect, useRef } from 'react';
import { useRoutesState } from '../states/RoutesState';
import { useAuthState } from '../states/AuthState';
import { useTicketState } from '../states/TicketState';
import { toast } from 'react-toastify';
import { useReportState } from '../states/ReportState';

interface UseRoutesManagementProps {
    report: any;
    reportStatusChecked: boolean;
}

export const useRoutesManagement = ({ 
    report, 
    reportStatusChecked
}: UseRoutesManagementProps) => {
    const { routes, routesLoading, fetchRoutes, resetRoutesState } = useRoutesState();
    const { logout } = useAuthState();
    const { resetReportState } = useReportState();
    const { resetTicketState } = useTicketState();

    // Fetch routes when report is available
    useEffect(() => {
        fetchRoutes();
    }, []);

    // Handle no routes available (only show toast once per session)
    useEffect(() => {
        if (
            routes.length === 0 && 
            !routesLoading
        ) {
            toast.info("No hay rutas disponibles");
            resetRoutesState();
            resetTicketState();
            resetReportState();
            logout();
        }
    }, [routes, routesLoading]);

    return {
        routes,
        routesLoading
    };
};
