import { useState, useCallback } from "react";
import { GetLatestReportsByUsername } from "../../wailsjs/go/services/ReportService";
import { models } from "../../wailsjs/go/models";

export const useLatestReports = (username?: string) => {
    const [latestReports, setLatestReports] = useState<models.Report[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchLatestReports = useCallback(async () => {
        if (!username) return;

        setLoading(true);
        try {
            const reports = await GetLatestReportsByUsername(username);
            setLatestReports(reports && Array.isArray(reports) ? reports : []);
        } catch (error) {
            console.error("Error fetching latest reports:", error);
            setLatestReports([]);
        } finally {
            setLoading(false);
        }
    }, [username]);

    return {
        latestReports,
        fetchLatestReports,
        loading,
    };
};
