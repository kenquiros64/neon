import { useState, useEffect } from 'react';
import { useReportState } from '../states/ReportState';
import { useAuthState } from '../states/AuthState';

export const useReportCheck = () => {
    const { report, checkReportStatus, reportLoading } = useReportState();
    const { logout } = useAuthState();
    const [reportStatusChecked, setReportStatusChecked] = useState(false);

    // Check report status when component mounts
    useEffect(() => {
        if (!report && !reportLoading) {
            checkReportStatus().catch((error) => {
                if (error === "ROW_NOT_FOUND") {
                    setReportStatusChecked(true);   
                    return;
                }
                console.error("Error checking report status", error);
                setReportStatusChecked(true);
                logout();
            });
            return;
        }
        
        if (report) {
            setReportStatusChecked(true);
        }
    }, [report, reportLoading]);

    return {
        report,
        reportLoading,
        reportStatusChecked
    };
};
