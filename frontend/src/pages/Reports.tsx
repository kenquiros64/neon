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
import { toast } from "react-toastify";
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

    
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeType, setCloseType] = useState<'partial' | 'total'>('partial');

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('es-CR');
    };

    const handlePrintReport = (reportToPrint: models.Report) => {
        // Implement print functionality
        toast.info('Funcionalidad de impresión en desarrollo');
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

        if (type === 'partial') {
            await partialCloseReport(report.id, cashAmount);
            toast.success('Reporte cerrado parcialmente');
        } else {
            await totalCloseReport(report.id, cashAmount);
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

                            {/* Detailed Breakdown */}
                            <Typography variant="h6" gutterBottom>
                                Desglose Detallado
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Tiquetes Regulares: {report.total_regular} - ₡{report.total_regular_cash.toLocaleString()}</Typography>
                                    <Typography variant="body2" color="text.secondary">Tiquetes Gold: {report.total_gold} - ₡{report.total_gold_cash.toLocaleString()}</Typography>
                                    <Typography variant="body2" color="text.secondary">Tiquetes Anulados: {report.total_null} - ₡{report.total_null_cash.toLocaleString()}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Creado: {formatDateTime(report.created_at)}</Typography>
                                    {report.partial_closed_at && (
                                        <Typography variant="body2" color="text.secondary">Cierre Parcial: {formatDateTime(report.partial_closed_at)}</Typography>
                                    )}
                                    {report.partial_closed_at && (
                                        <Typography variant="body2" color="text.secondary">Tiquetes Vendidos durante Cierre Parcial: {report.partial_tickets}</Typography>
                                    )}
                                </Grid>
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