import { useState, useEffect } from 'react';

interface UseStartReportDialogProps {
    report: any;
    reportStatusChecked: boolean;
    reportLoading: boolean;
}

export const useStartReportDialog = ({ 
    report, 
    reportStatusChecked, 
    reportLoading 
}: UseStartReportDialogProps) => {
    const [showStartReportDialog, setShowStartReportDialog] = useState(false);

    // Show dialog when no report exists and status has been checked
    useEffect(() => {
        if (!report && reportStatusChecked && !reportLoading) {
            setShowStartReportDialog(true);
        } else if (report) {
            setShowStartReportDialog(false);
        }
    }, [report, reportStatusChecked, reportLoading]);

    return {
        showStartReportDialog
    };
};
