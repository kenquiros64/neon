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
    report.partial_cash + report.final_cash;

export const getReportDifference = (report: models.Report) =>
    report.total_cash - getReportDeliveriesTotal(report);
