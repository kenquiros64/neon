import { useState, useEffect } from 'react';
import { useReportState } from '../states/ReportState';
import { useAuthState } from '../states/AuthState';
import { useTicketState } from '../states/TicketState';
import { useRoutesState } from '../states/RoutesState';
import { toast } from 'react-toastify';

function getErrorMessage(error: unknown): string {
    if (error == null) return 'Error desconocido';
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return String(error);
}

export const useReportCheck = () => {
    const { report, checkReportStatus, resetReportState } = useReportState();
    const { resetTicketState } = useTicketState();
    const { resetRoutesState } = useRoutesState();
    const { logout } = useAuthState();
    const [reportStatusChecked, setReportStatusChecked] = useState(false);

    // Check report status when component mounts
    useEffect(() => {
        setReportStatusChecked(false);

        checkReportStatus()
            .then(() => {
                setReportStatusChecked(true);
            })
            .catch((error) => {
                const msg = getErrorMessage(error);
                const isRowNotFound = msg.includes('ROW_NOT_FOUND') || msg.includes('row not found') || error === 'ROW_NOT_FOUND';

                if (isRowNotFound) {
                    setReportStatusChecked(true);
                    return;
                }

                toast.error(`Error al verificar el reporte: ${msg}`, { autoClose: 8000 });
                setReportStatusChecked(true);
                resetReportState();
                resetTicketState();
                resetRoutesState();
                logout();
            });
    }, []);

    return {
        report,
        reportStatusChecked
    };
};
