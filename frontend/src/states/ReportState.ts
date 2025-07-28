import { create } from 'zustand';
import {models} from "../../wailsjs/go/models";
import { CheckIfThereIsAnOpenOrPendingReport, StartReport, PartialCloseReport, TotalCloseReport } from "../../wailsjs/go/services/ReportService";

interface ReportState {
    report: models.Report | null;
    reportLoading: boolean;
    startReport: (username: string) => Promise<models.Report>;
    checkReportStatus: () => Promise<models.Report | null>;
    partialCloseReport: (reportID: number, finalCash: number) => Promise<models.Report>;
    totalCloseReport: (reportID: number, finalCash: number) => Promise<models.Report>;
    resetReportState: () => void;
}

export const useReportState = create<ReportState>((set, get) => ({
    report: null,
    reportLoading: false,

    startReport: async (username: string) => {
        set({ reportLoading: true });
        try {
            const output = await StartReport(username);
            set({ report: output, reportLoading: false });
            return output;
        } catch (error) {
            console.error("Error starting report", error);
            set({ report: null, reportLoading: false });
            throw error;
        }
    },

    checkReportStatus: async () => {
        set({ reportLoading: true });
        try {
            const output = await CheckIfThereIsAnOpenOrPendingReport();
            set({ report: output, reportLoading: false });
            return output;
        } catch (error) {
            console.error("Error checking report status", error);
            // If no report found, this is not an error state
            set({ report: null, reportLoading: false });
            throw error;
        }
    },

    partialCloseReport: async (reportID: number, finalCash: number) => {
        set({ reportLoading: true });
        try {
            const output = await PartialCloseReport(reportID, finalCash);
            set({ report: output, reportLoading: false });
            return output;
        } catch (error) {
            console.error("Error partial closing report", error);
            set({ report: null, reportLoading: false });
            throw error;
        }
    },

    totalCloseReport: async (reportID: number, finalCash: number) => {
        set({ reportLoading: true });
        try {
            const output = await TotalCloseReport(reportID, finalCash);
            set({ report: null, reportLoading: false });
            return output;
        } catch (error) {
            console.error("Error total closing report", error);
            set({ report: null, reportLoading: false });
            throw error;
        }
    },


    resetReportState: () => set({ report: null, reportLoading: false })
}));
