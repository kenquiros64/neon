import { useState, useEffect } from "react";
import { GetLatestReportsByUsername } from "../../wailsjs/go/services/ReportService";
import { models } from "../../wailsjs/go/models";

export const useLatestReports = (username?: string) => {
    const [latestReports, setLatestReports] = useState<models.Report[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLatestReports = async () => {
        if (!username) return;
        
        setLoading(true);
        try {
            const reports = await GetLatestReportsByUsername(username);
            // Ensure reports is an array and handle null/undefined cases
            if (reports && Array.isArray(reports)) {
                setLatestReports(reports);
            } else {
                setLatestReports([]);
            }
        } catch (error) {
            console.error("Error fetching latest reports:", error);
            setLatestReports([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLatestReports();
    }, [username]);

    return {
        latestReports,
        fetchLatestReports,
        loading,
    };
}; 