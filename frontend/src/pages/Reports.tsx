import React, { useEffect, useState } from "react";
import {
    Box,
    Grid,
    Divider,
    Alert,
    CircularProgress,
    Typography,
} from "@mui/material";
import { Assignment } from "@mui/icons-material";
import { useReportCheck } from "../hooks/useReportCheck";
import { useReportState } from "../states/ReportState";
import { useAuthState } from "../states/AuthState";
import { useLatestReports } from "../hooks/useLatestReports";
import { usePrinters } from "../hooks/usePrinters";
import { toast } from "react-toastify";
import { PrintReport } from "../../wailsjs/go/services/PrintService";
import ReportStatsCards from "../components/ReportStatsCards";
import LatestReportsTable from "../components/LatestReportsTable";
import ReportActionsPanel from "../components/ReportActionsPanel";
import CloseReportDialog from "../components/CloseReportDialog";
import { DepositSummaryCard } from "../components/DepositSummaryCard";
import { DashboardPageHeader } from "../components/dashboard/DashboardPageHeader";
import { dashboardPageSx, dashboardPanelSx } from "../theme/dashboardTheme";
import {
    formatCurrency,
    formatDateTime,
    getTimetableLabel,
} from "../util/reportHelpers";

const Reports: React.FC = () => {
    const { report, reportStatusChecked } = useReportCheck();
    const { reportLoading, partialCloseReport, totalCloseReport, checkReportStatus } = useReportState();
    const { user } = useAuthState();
    const { latestReports, fetchLatestReports } = useLatestReports(user?.username);
    const { defaultPrinter } = usePrinters();

    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeType, setCloseType] = useState<'partial' | 'total'>('partial');

    const handlePrintReport = async (reportToPrint: typeof report) => {
        if (!reportToPrint || !defaultPrinter) {
            toast.error('No hay impresora configurada');
            return;
        }
        try {
            await PrintReport(reportToPrint, defaultPrinter);
            toast.success('Reporte enviado a la impresora');
        } catch (error: any) {
            toast.error(error?.message || 'Error al imprimir el reporte');
        }
    };

    const handleOpenCloseDialog = (type: 'partial' | 'total') => {
        setCloseType(type);
        setCloseDialogOpen(true);
    };

    const handleCloseReport = async (cashAmount: number, type: 'partial' | 'total') => {
        if (!report) {
            toast.error('No hay reporte activo');
            return;
        }
        const closedBy = user?.username ?? '';
        if (!closedBy) {
            toast.error('No se pudo identificar el usuario');
            return;
        }

        if (type === 'partial') {
            await partialCloseReport(report.id, cashAmount, closedBy);
            toast.success('Reporte cerrado parcialmente');
        } else {
            await totalCloseReport(report.id, cashAmount, closedBy);
            toast.success('Reporte cerrado totalmente');
            await fetchLatestReports();
        }
    };

    useEffect(() => {
        checkReportStatus();
    }, []);

    useEffect(() => {
        if (reportStatusChecked) {
            fetchLatestReports();
        }
    }, [reportStatusChecked, user?.username]);

    if (!reportStatusChecked || reportLoading) {
        return (
            <Box sx={{ ...dashboardPageSx, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <CircularProgress />
            </Box>
        );
    }

    const tableBlock = (
        <Box sx={{ ...dashboardPanelSx, p: 2 }}>
            <LatestReportsTable
                latestReports={latestReports}
                onPrintReport={handlePrintReport}
            />
        </Box>
    );

    if (!report) {
        return (
            <Box sx={dashboardPageSx}>
                <DashboardPageHeader
                    breadcrumb="Operaciones"
                    title="Reportes"
                    subtitle="Historial de sus últimos reportes cerrados"
                />
                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                    No hay reporte activo. Vaya a Boletería para iniciar uno nuevo.
                </Alert>
                {tableBlock}
            </Box>
        );
    }

    const isPendingReport = report.partial_closed_at !== null && report.closed_at === null;

    return (
        <Box sx={dashboardPageSx}>
            <DashboardPageHeader
                breadcrumb="Operaciones"
                title="Reportes"
                subtitle={`Reporte activo #${report.id}`}
            />

            {isPendingReport && (
                <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
                    Reporte pendiente de verificación. Complete el cierre total con el efectivo del turno final.
                </Alert>
            )}

            <DepositSummaryCard report={report} isPendingReport={isPendingReport} />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Box sx={{ ...dashboardPanelSx, p: 2.5 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Assignment color="primary" />
                            Reporte actual
                        </Typography>

                        <ReportStatsCards report={report} isPendingReport={isPendingReport} />

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="subtitle2" color="text.secondary" fontWeight={600} gutterBottom>
                            Desglose
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            {[
                                { label: 'Regulares', count: report.total_regular, cash: report.total_regular_cash },
                                { label: 'Gold', count: report.total_gold, cash: report.total_gold_cash },
                                { label: 'Anulados', count: report.total_null, cash: report.total_null_cash },
                            ].map((row) => (
                                <Grid size={{ xs: 12, sm: 4 }} key={row.label}>
                                    <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                                        <Typography variant="caption" color="text.secondary">{row.label}</Typography>
                                        <Typography variant="h6">{row.count}</Typography>
                                        <Typography variant="body2">{formatCurrency(row.cash)}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>

                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">Usuario</Typography>
                                <Typography fontWeight={500}>{report.username}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">Horario</Typography>
                                <Typography>{getTimetableLabel(report.timetable)}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">Creado</Typography>
                                <Typography>{formatDateTime(report.created_at)}</Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 4 }}>
                    <ReportActionsPanel
                        isPendingReport={isPendingReport}
                        reportLoading={reportLoading}
                        reportId={report.id}
                        onOpenCloseDialog={handleOpenCloseDialog}
                    />
                </Grid>

                <Grid size={12}>
                    {tableBlock}
                </Grid>
            </Grid>

            <CloseReportDialog
                open={closeDialogOpen}
                closeType={closeType}
                report={report}
                reportLoading={reportLoading}
                onClose={() => setCloseDialogOpen(false)}
                onCloseReport={handleCloseReport}
            />
        </Box>
    );
};

export default Reports;
