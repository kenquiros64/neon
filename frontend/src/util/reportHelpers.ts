import { models } from "../../wailsjs/go/models";

export const formatCurrency = (amount: number) => `₡${amount.toLocaleString()}`;

export const formatDateTime = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("es-CR");
};

export const formatDateShort = (dateString?: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("es-CR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

export const getTimetableLabel = (timetable: models.Report["timetable"]) =>
    timetable === "regular" ? "Regular" : "Feriado";

export const getReportDeliveriesTotal = (report: models.Report) =>
    report.partial_cash_received + report.final_cash_received;

export const getReportDifference = (report: models.Report) =>
    report.partial_cash + report.final_cash - getReportDeliveriesTotal(report);

/** Cash the seller should physically deposit at close time */
export const getDepositAmount = (
    report: models.Report,
    closeType: 'partial' | 'total'
): number => {
    const isPending = report.partial_closed_at != null && report.closed_at == null;
    if (closeType === 'partial') {
        return report.partial_cash;
    }
    if (isPending) {
        return report.final_cash;
    }
    return report.partial_cash + report.final_cash;
};

export const getExpectedSalesTotal = (report: models.Report) =>
    report.partial_cash + report.final_cash;
