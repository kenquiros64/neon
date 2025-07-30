import { useEffect, useRef } from 'react';
import { useRoutesState } from '../states/RoutesState';
import { useAuthState } from '../states/AuthState';
import { useTicketState } from '../states/TicketState';
import { toast } from 'react-toastify';

interface UseRoutesManagementProps {
    report: any;
    reportStatusChecked: boolean;
    reportLoading: boolean;
}

export const useRoutesManagement = ({ 
    report, 
    reportStatusChecked, 
    reportLoading 
}: UseRoutesManagementProps) => {
    const { routes, routesLoading, fetchRoutes, resetRoutesState } = useRoutesState();
    const { logout } = useAuthState();
    const { resetTicketState } = useTicketState();
    const hasShownNoRoutesToast = useRef(false);

    // Fetch routes when report is available
    useEffect(() => {
        if (report && reportStatusChecked && !reportLoading) {
            fetchRoutes();
        }
    }, [report, reportStatusChecked, reportLoading]);

    // Handle no routes available (only show toast once per session)
    useEffect(() => {
        if (
            routes.length === 0 && 
            !routesLoading && 
            !reportLoading && 
            reportStatusChecked && 
            report && 
            !hasShownNoRoutesToast.current
        ) {
            hasShownNoRoutesToast.current = true;
            toast.info("No hay rutas disponibles");
            resetRoutesState();
            resetTicketState();
            logout();
        }
    }, [routes, routesLoading, reportLoading, reportStatusChecked, report]);

    // Reset toast flag when user logs back in
    useEffect(() => {
        if (report) {
            hasShownNoRoutesToast.current = false;
        }
    }, [report]);

    return {
        routes,
        routesLoading
    };
};
