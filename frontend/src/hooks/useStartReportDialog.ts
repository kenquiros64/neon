import { useState, useEffect } from 'react';
import { useReportState } from '../states/ReportState';

interface UseStartReportDialogProps {
    reportStatusChecked: boolean;
}

export const useStartReportDialog = ({ 
    reportStatusChecked
}: UseStartReportDialogProps) => {
    const { report } = useReportState();
    const [showStartReportDialog, setShowStartReportDialog] = useState(false);
    
    // Show dialog when no report exists and status has been checked
    useEffect(() => {
        if (!report && reportStatusChecked) {
            setShowStartReportDialog(true);
        } else if (report) {
            setShowStartReportDialog(false);
        }
    }, [report, reportStatusChecked]);

    return {
        showStartReportDialog
    };
};
