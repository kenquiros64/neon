import React, { useEffect, useState, useCallback } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Divider,
    Alert,
    CircularProgress
} from "@mui/material";
import {
    Receipt,
    Assignment
} from "@mui/icons-material";
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
import { models } from "../../wailsjs/go/models";

const Reports: React.FC = () => {
    const { report, reportStatusChecked } = useReportCheck();
    const { reportLoading, partialCloseReport, totalCloseReport, checkReportStatus } = useReportState();
    const { user } = useAuthState();
    const { latestReports, fetchLatestReports } = useLatestReports(user?.username);
    const { defaultPrinter } = usePrinters();

    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeType, setCloseType] = useState<'partial' | 'total'>('partial');

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString("es-CR");
    };

    const formatCurrency = (amount: number) => `₡${amount.toLocaleString()}`;

    const handlePrintReport = async (reportToPrint: models.Report) => {
        if (!defaultPrinter) {
            toast.error('No hay impresora configurada. Configure PRINTER_DEVICE (macOS) o instale una impresora (Windows).');
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
            // After total close, fetch latest reports to show the newly closed report
            await fetchLatestReports();
        }
    };

    useEffect(() => {
        checkReportStatus()
    }, []);

    // Load latest reports when component mounts or when report status changes
    useEffect(() => {
        if (reportStatusChecked) {
            fetchLatestReports();
        }
    }, [reportStatusChecked]);

    if (!reportStatusChecked || reportLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!report) {
        return (
            <Box sx={{ p: 3, mx: 'auto', mt: 4 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="h6">No hay reporte activo</Typography>
                    <Typography>No se encontró un reporte abierto o pendiente. Vaya a la página de tiquetes para iniciar uno nuevo.</Typography>
                </Alert>

                {/* Latest Reports Table when no active report */}
                <Card>
                    <CardContent>
                        <LatestReportsTable 
                            latestReports={latestReports}
                            onPrintReport={handlePrintReport}
                        />
                    </CardContent>
                </Card>
            </Box>
        );
    }

    const isPendingReport = report.partial_closed_at !== null && report.closed_at === null;

    return (
        <Box sx={{ p: 3, mx: 'auto' }}>
            {/* Report Status Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Receipt color="primary" />
                    Gestión de Reportes
                </Typography>
                
                {isPendingReport && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="h6">Reporte Pendiente de Verificación</Typography>
                        <Typography>Este reporte tiene efectivo sin verificar. Complete la verificación para cerrarlo totalmente.</Typography>
                    </Alert>
                )}
            </Box>

            <Grid container spacing={3}>
                {/* Current Report Details */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Assignment color="primary" />
                                Reporte Actual - ID #{report.id}
                            </Typography>
                            
                            <ReportStatsCards 
                                report={report} 
                                isPendingReport={isPendingReport} 
                            />

                            <Divider sx={{ my: 3 }} />

                            {/* Desglose detallado */}
                            <Typography variant="subtitle1" fontWeight={600} color="text.secondary" gutterBottom>
                                Desglose detallado
                            </Typography>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            p: 2,
                                            minHeight: 80,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            bgcolor: "action.hover",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">Regulares</Typography>
                                        <Typography variant="h6">{report.total_regular}</Typography>
                                        <Typography variant="body2">{formatCurrency(report.total_regular_cash)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            p: 2,
                                            minHeight: 80,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            bgcolor: "action.hover",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">Gold</Typography>
                                        <Typography variant="h6">{report.total_gold}</Typography>
                                        <Typography variant="body2">{formatCurrency(report.total_gold_cash)}</Typography>
                                    </Box>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 4 }}>
                                    <Box
                                        sx={{
                                            textAlign: "center",
                                            p: 2,
                                            minHeight: 80,
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            bgcolor: "action.hover",
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Typography variant="caption" color="text.secondary">Anulados</Typography>
                                        <Typography variant="h6">{report.total_null}</Typography>
                                        <Typography variant="body2">{formatCurrency(report.total_null_cash)}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: "block", mb: 1 }}>
                                Información
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Usuario</Typography>
                                    <Typography variant="body1" fontWeight={500}>{report.username}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Creado</Typography>
                                    <Typography variant="body1">{formatDateTime(report.created_at)}</Typography>
                                </Grid>
                                {report.partial_closed_at && (
                                    <>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="body2" color="text.secondary">Cierre parcial</Typography>
                                            <Typography variant="body1">{formatDateTime(report.partial_closed_at)}</Typography>
                                            {report.partial_closed_by && (
                                                <Typography variant="body2" color="text.secondary">por {report.partial_closed_by}</Typography>
                                            )}
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="body2" color="text.secondary">Tiquetes en cierre parcial</Typography>
                                            <Typography variant="body1">{report.partial_tickets}</Typography>
                                            {report.partial_cash != null && report.partial_cash > 0 && (
                                                <Typography variant="body2" color="text.secondary">{formatCurrency(report.partial_cash)} efectivo contado</Typography>
                                            )}
                                        </Grid>
                                    </>
                                )}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Action Panel */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <ReportActionsPanel
                        isPendingReport={isPendingReport}
                        reportLoading={reportLoading}
                        reportId={report.id}
                        onOpenCloseDialog={handleOpenCloseDialog}
                    />
                </Grid>

                {/* Latest Reports Table */}
                <Grid size={12}>
                    <Card>
                        <CardContent>
                            <LatestReportsTable 
                                latestReports={latestReports}
                                onPrintReport={handlePrintReport}
                            />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Close Report Dialog */}
            <CloseReportDialog
                open={closeDialogOpen}
                closeType={closeType}
                reportLoading={reportLoading}
                onClose={() => setCloseDialogOpen(false)}
                onCloseReport={handleCloseReport}
            />
        </Box>
    );
};

export default Reports;