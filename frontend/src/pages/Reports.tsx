import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Divider,
    Alert,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    CircularProgress,
    IconButton,
    Tooltip
} from "@mui/material";
import {
    MonetizationOn,
    Receipt,
    Warning,
    CheckCircle,
    Cancel,
    Print,
    Search,
    LocalAtm,
    Assignment,
    Timeline,
    AttachMoney,
    RotateLeft
} from "@mui/icons-material";
import { useReportState } from "../states/ReportState";
import { useRoutesState } from "../states/RoutesState";
import { useAuthState } from "../states/AuthState";
import { toast } from "react-toastify";
import { NullifyTicket, UpdateTickets } from "../../wailsjs/go/services/TicketService";
import { models } from "../../wailsjs/go/models";

const Reports: React.FC = () => {
    const { report, checkReportStatus, partialCloseReport, totalCloseReport, reportLoading } = useReportState();
    const { fetchRoutes } = useRoutesState();
    const [reportStatusChecked, setReportStatusChecked] = useState(false);
    const [closeDialogOpen, setCloseDialogOpen] = useState(false);
    const [closeType, setCloseType] = useState<'partial' | 'total'>('partial');
    const [finalCash, setFinalCash] = useState<string>('');
    const [ticketIDToNull, setTicketIDToNull] = useState<string>('');
    const [nullifyLoading, setNullifyLoading] = useState(false);
    const { user } = useAuthState();

    // Mock data for latest reports (you'll need to implement the actual service)
    const [latestReports, setLatestReports] = useState<models.Report[]>([]);

    const checkAndLoadReport = async () => {
        try {
            await checkReportStatus();
            setReportStatusChecked(true);
        } catch (error) {
            console.error("Error checking report status:", error);
            setReportStatusChecked(true);
        }
    };

    const handleCloseReport = async () => {
        const cashAmount = parseFloat(finalCash);
        if (!finalCash || isNaN(cashAmount) || cashAmount < 0) {
            toast.error('Por favor ingrese un monto final válido');
            return;
        }

        if (!report) {
            toast.error('No hay reporte activo');
            return;
        }

        try {
            if (closeType === 'partial') {
                await partialCloseReport(report.id, Math.round(cashAmount));
                toast.success('Reporte cerrado parcialmente');
            } else {
                await totalCloseReport(report.id, Math.round(cashAmount));
                toast.success('Reporte cerrado totalmente');
            }
            setCloseDialogOpen(false);
            setFinalCash('');
        } catch (error) {
            console.error('Error closing report:', error);
            toast.error('Error al cerrar el reporte');
        }
    };

    const handleNullifyTicket = async () => {
        const ticketID = parseInt(ticketIDToNull);
        if (!ticketIDToNull || isNaN(ticketID)) {
            toast.error('Por favor ingrese un ID de ticket válido');
            return;
        }

        setNullifyLoading(true);
        try {
            // Create a mock ticket with the ID to update (you'll need the actual ticket data)
            const ticketToUpdate = new models.Ticket({
                id: ticketID,
                is_null: true,
            });

            await NullifyTicket(ticketID, report?.id ?? 0);
            toast.success(`Tiquete ${ticketID} marcado como devuelto`);
            setTicketIDToNull('');
        } catch (error) {
            if (error === "TICKET_NOT_BELONG_TO_REPORT") {
                toast.error('El tiquete no pertenece al reporte actual');
                return;
            }
            if (error === "TICKET_ALREADY_NULLIFIED") {
                toast.error('El tiquete ya ha sido anulado previamente');
                return;
            }
            if (error === "TICKET_ALREADY_CLOSED") {
                toast.error('Tiquete no se puede anular, fue creado antes del cierre parcial');
                return;
            }
            console.error('Error nullifying ticket:', error);
            toast.error('Error al anular el ticket. Verifique que el ID existe.');
        } finally {
            setNullifyLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return `₡${amount.toLocaleString()}`;
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('es-CR');
    };

    const handlePrintReport = (reportToPrint: models.Report) => {
        // Implement print functionality
        toast.info('Funcionalidad de impresión en desarrollo');
    };

    useEffect(() => {
        if (!reportStatusChecked) {
            checkAndLoadReport();
        }
    }, [reportStatusChecked]);

    // Check report status when component mounts
    useEffect(() => {
        console.log('Reports page mounted, checking report status');
        checkAndLoadReport();
    }, []);

    // React to report state changes from other components (like when a report is started)
    useEffect(() => {
        console.log('Report state changed in Reports page:', report);
        if (report) {
            // If we received a report from the global state, mark as checked
            setReportStatusChecked(true);
        }
    }, [report]);

    useEffect(() => {
        if (report && report.status) {
            fetchRoutes();
        }
    }, [report]);

    useEffect(() => {
        if (!nullifyLoading) {
            checkAndLoadReport()
        }
    }, [nullifyLoading]);

    if (!reportStatusChecked || reportLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (!report) {
        return (
            <Box sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 8 }}>
                <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="h6">No hay reporte activo</Typography>
                    <Typography>No se encontró un reporte abierto o pendiente. Vaya a la página de tiquetes para iniciar uno nuevo.</Typography>
                </Alert>
            </Box>
        );
    }

    const isPendingReport = report.partial_closed_at !== null && report.closed_at === null;

    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
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
                            
                            <Grid container spacing={2} sx={{ mt: 1 }}>
                                {/* <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'primary.light', borderRadius: 2 }}>
                                        <LocalAtm sx={{ fontSize: 32, color: 'primary.contrastText', mb: 1 }} />
                                        <Typography variant="h6" color="primary.contrastText">
                                            {formatCurrency(report.initial_cash)}
                                        </Typography>
                                        <Typography variant="body2" color="primary.contrastText">
                                            Efectivo Inicial
                                        </Typography>
                                    </Box>
                                </Grid> */}
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'info.light', borderRadius: 2 }}>
                                        <Receipt sx={{ fontSize: 32, color: 'info.contrastText', mb: 1 }} />
                                        <Typography variant="h6" color="info.contrastText">
                                            {report.total_tickets}
                                        </Typography>
                                        <Typography variant="body2" color="info.contrastText">
                                            Tiquetes Vendidos
                                        </Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid size={{ xs: 6, sm: 3 }}>
                                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', borderRadius: 2 }}>
                                        <AttachMoney sx={{ fontSize: 32, color: 'success.contrastText', mb: 1 }} />
                                        <Typography variant="h6" color="success.contrastText">
                                            {formatCurrency(report.total_cash)}
                                        </Typography>
                                        <Typography variant="body2" color="success.contrastText">
                                            Total Generado
                                        </Typography>
                                    </Box>
                                </Grid>
                                
                                
                                {isPendingReport && (
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.light', borderRadius: 2 }}>
                                            <Warning sx={{ fontSize: 32, color: 'warning.contrastText', mb: 1 }} />
                                            <Typography variant="h6" color="warning.contrastText">
                                                {formatCurrency(report.partial_cash)}
                                            </Typography>
                                            <Typography variant="body2" color="warning.contrastText">
                                                Efectivo Pendiente
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}
                            </Grid>

                            <Divider sx={{ my: 3 }} />

                            {/* Detailed Breakdown */}
                            <Typography variant="h6" gutterBottom>
                                Desglose Detallado
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="body2" color="text.secondary">Tiquetes Regulares: {report.total_regular} - {formatCurrency(report.total_regular_cash)}</Typography>
                                    <Typography variant="body2" color="text.secondary">Tiquetes Gold: {report.total_gold} - {formatCurrency(report.total_gold_cash)}</Typography>
                                    <Typography variant="body2" color="text.secondary">Tiquetes Anulados: {report.total_null} - {formatCurrency(report.total_null_cash)}</Typography>
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
                    {/* Close Report Actions */}
                    <Card sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Acciones de Cierre
                            </Typography>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {!isPendingReport && (
                                    <Button
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<Warning />}
                                        onClick={() => {
                                            setCloseType('partial');
                                            setCloseDialogOpen(true);
                                        }}
                                        disabled={reportLoading}
                                    >
                                        Cierre Parcial
                                    </Button>
                                )}
                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<Cancel />}
                                    onClick={() => {
                                        setCloseType('total');
                                        setCloseDialogOpen(true);
                                    }}
                                    disabled={reportLoading}
                                >
                                    Cierre Total
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    {/* Nullify Ticket */}
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Anular Tiquete
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Marcar un tiquete como devuelto por el cliente
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <TextField
                                    size="small"
                                    label="ID del tiquete"
                                    value={ticketIDToNull}
                                    onChange={(e) => setTicketIDToNull(e.target.value)}
                                    type="number"
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <Search />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleNullifyTicket}
                                    disabled={nullifyLoading || !ticketIDToNull}
                                    startIcon={nullifyLoading ? <CircularProgress size={16} /> : <RotateLeft />}
                                >
                                    Anular
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Latest Reports Table */}
                <Grid size={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Timeline color="primary" />
                                Últimos 2 Reportes
                                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                                    Para reimprimir reportes anteriores
                                </Typography>
                            </Typography>
                            
                            {latestReports.length === 0 ? (
                                <Alert severity="info">
                                    No hay reportes anteriores disponibles
                                </Alert>
                            ) : (
                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>ID</TableCell>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell align="right">Total Generado</TableCell>
                                                <TableCell align="right">Tiquetes</TableCell>
                                                <TableCell>Estado</TableCell>
                                                <TableCell align="center">Acciones</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {latestReports.map((pastReport) => (
                                                <TableRow key={pastReport.id}>
                                                    <TableCell>#{pastReport.id}</TableCell>
                                                    <TableCell>{formatDateTime(pastReport.created_at)}</TableCell>
                                                    <TableCell align="right">{formatCurrency(pastReport.total_cash)}</TableCell>
                                                    <TableCell align="right">{pastReport.total_tickets}</TableCell>
                                                    {/* <TableCell>
                                                        <Chip
                                                            label={pastReport.status ? 'Abierto' : pastReport.cash_verified ? 'Pendiente' : 'Cerrado'}
                                                            color={pastReport.status ? 'success' : pastReport.cash_verified ? 'warning' : 'default'}
                                                            size="small"
                                                        />
                                                    </TableCell> */}
                                                    <TableCell align="center">
                                                        <Tooltip title="Reimprimir reporte">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handlePrintReport(pastReport)}
                                                                color="primary"
                                                            >
                                                                <Print />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Close Report Dialog */}
            <Dialog open={closeDialogOpen} onClose={() => setCloseDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {closeType === 'partial' ? 'Cierre Parcial de Reporte' : 'Cierre Total de Reporte'}
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {closeType === 'partial' 
                            ? 'El cierre parcial permite continuar vendiendo tiquetes pero registra el estado actual.'
                            : 'El cierre total finaliza completamente el reporte. No se podrán vender más tiquetes.'
                        }
                    </Typography>   
                    <TextField
                        fullWidth
                        label="Efectivo final contado"
                        value={finalCash}
                        onChange={(e) => setFinalCash(e.target.value)}
                        type="number"
                        slotProps={{
                            input: {
                                startAdornment: (
                                <InputAdornment position="start">
                                    <LocalAtm />
                                    </InputAdornment>
                                )
                            }
                        }}
                        helperText="Ingrese el monto total de efectivo contado al momento del cierre"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCloseDialogOpen(false)}>
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleCloseReport} 
                        variant="contained"
                        color={closeType === 'partial' ? 'warning' : 'error'}
                        disabled={reportLoading || !finalCash}
                    >
                        {closeType === 'partial' ? 'Cierre Parcial' : 'Cierre Total'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Reports;