import { useState, useEffect } from 'react';
import { useReportState } from '../states/ReportState';
import { useAuthState } from '../states/AuthState';
import { useTicketState } from '../states/TicketState';
import { useRoutesState } from '../states/RoutesState';

export const useReportCheck = () => {
    const { report, checkReportStatus, resetReportState } = useReportState();
    const { resetTicketState } = useTicketState();
    const { resetRoutesState } = useRoutesState();
    const { logout } = useAuthState();
    const [reportStatusChecked, setReportStatusChecked] = useState(false);

    // Check report status when component mounts
    useEffect(() => {
        setReportStatusChecked(false);
        if (!report) {
            checkReportStatus().then((report) => {
                setReportStatusChecked(true);
            }).catch((error) => {
                if (error === "ROW_NOT_FOUND") {
                    setReportStatusChecked(true);   
                    return;
                }
                console.error("Error checking report status", error);
                setReportStatusChecked(true);
                resetReportState();
                resetTicketState();
                resetRoutesState();
                logout();
            });
            return;
        }
        setReportStatusChecked(true);
    }, []);

    return {
        report,
        reportStatusChecked
    };
};
