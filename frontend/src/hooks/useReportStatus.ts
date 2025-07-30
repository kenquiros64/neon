import { useState, useEffect } from 'react';
import { useReportState } from '../states/ReportState';
import { useRoutesState } from '../states/RoutesState';
import { useAuthState } from '../states/AuthState';
import { toast } from 'react-toastify';

export const useReportStatus = () => {
    const { report, checkReportStatus, reportLoading, resetReportState } = useReportState();
    const { routes, fetchRoutes, resetRoutesState } = useRoutesState();
    const { logout } = useAuthState();
    const [showStartReportDialog, setShowStartReportDialog] = useState(false);
    const [reportStatusChecked, setReportStatusChecked] = useState(false);

    // Check report status when component mounts
    useEffect(() => {
        if (!report) {
            checkReportStatus().catch((error) => {
                if (error === "ROW_NOT_FOUND") {
                    setReportStatusChecked(true);   
                    setShowStartReportDialog(true);
                    return;
                }
                console.error("Error checking report status", error);
                setReportStatusChecked(true);
                logout();
            });
            return;
        }
        fetchRoutes();
        setReportStatusChecked(true);
        setShowStartReportDialog(false);
    }, []);

    // Handle report changes
    useEffect(() => {
        if (report) {
            fetchRoutes();
            setReportStatusChecked(true);
            setShowStartReportDialog(false);
            return;
        }
        setShowStartReportDialog(true);
    }, [report, reportLoading]);

    // Handle routes availability
    useEffect(() => {
        if (routes.length === 0 && !reportLoading && reportStatusChecked) {
            toast.info("No hay rutas disponibles");
            resetRoutesState();
            logout();
        }
    }, [routes, reportLoading, reportStatusChecked]);

    const closeStartReportDialog = () => {
        setShowStartReportDialog(false);
    };

    return {
        showStartReportDialog,
        reportStatusChecked,
        closeStartReportDialog
    };
}; 