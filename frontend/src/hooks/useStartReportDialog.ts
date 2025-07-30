import { useState, useEffect } from 'react';
import { useReportState } from '../states/ReportState';

interface UseStartReportDialogProps {
    report: any;
    reportStatusChecked: boolean;
}

export const useStartReportDialog = ({ 
    report, 
    reportStatusChecked
}: UseStartReportDialogProps) => {
    const [showStartReportDialog, setShowStartReportDialog] = useState(false);
    const { reportLoading } = useReportState();
    
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
