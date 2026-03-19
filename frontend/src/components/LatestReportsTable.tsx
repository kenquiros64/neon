import React, { useState } from "react";
import {
    Typography,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    Paper,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Grid,
    Divider,
} from "@mui/material";
import { Timeline, Print, Visibility, Receipt } from "@mui/icons-material";
import { models } from "../../wailsjs/go/models";
import {
    formatCurrency,
    formatDateTime,
    formatDateShort,
    getReportDeliveriesTotal,
    getReportDifference,
    getTimetableLabel,
} from "../util/reportHelpers";

interface LatestReportsTableProps {
    latestReports: models.Report[];
    onPrintReport: (report: models.Report) => void;
}

function reportStatus(report: models.Report): "open" | "pending" | "closed" {
    if (report.closed_at) return "closed";
    if (report.partial_closed_at) return "pending";
    return "open";
}

function ReportDetailDialog({
    report,
    open,
    onClose,
    onPrint,
}: {
    report: models.Report | null;
    open: boolean;
    onClose: () => void;
    onPrint: (r: models.Report) => void;
}) {
    if (!report) return null;
    const status = reportStatus(report);
    const statusLabel = status === "closed" ? "Cerrado" : status === "pending" ? "Pendiente verificación" : "Abierto";

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Receipt color="primary" />
                Reporte #{report.id} – {statusLabel}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    {/* Totales – grid simétrico */}
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Totales</Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        {/* Fila 1: totales principales */}
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    minHeight: 88,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    bgcolor: "action.hover",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="h5">{report.total_tickets}</Typography>
                                <Typography variant="caption" color="text.secondary">Total tiquetes</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 4 }}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    minHeight: 88,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    bgcolor: "primary.main",
                                    color: "primary.contrastText",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="h5">{formatCurrency(report.total_cash)}</Typography>
                                <Typography variant="caption">Total generado</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box
                                sx={{
                                    textAlign: "center",
                                    p: 2,
                                    minHeight: 88,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    bgcolor: "action.selected",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="body2" color="text.secondary" gutterBottom>Horario</Typography>
                                <Chip
                                    label={getTimetableLabel(report.timetable)}
                                    color={report.timetable === "regular" ? "primary" : "success"}
                                    size="small"
                                />
                            </Box>
                        </Grid>
                        {/* Fila 2: desglose por tipo (3 tarjetas iguales) */}
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

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">Usuario</Typography>
                            <Typography variant="body1" fontWeight={500}>{report.username}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">Creado</Typography>
                            <Typography variant="body1">{formatDateTime(report.created_at)}</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography variant="body2" color="text.secondary">Horario</Typography>
                            <Typography variant="body1">{getTimetableLabel(report.timetable)}</Typography>
                        </Grid>
                        {report.partial_closed_at && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">Cierre parcial</Typography>
                                <Typography variant="body1">{formatDateTime(report.partial_closed_at)}</Typography>
                                {report.partial_closed_by && (
                                    <Typography variant="body2" color="text.secondary">por {report.partial_closed_by}</Typography>
                                )}
                            </Grid>
                        )}
                        {report.closed_at && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2" color="text.secondary">Cierre total</Typography>
                                <Typography variant="body1">{formatDateTime(report.closed_at)}</Typography>
                                {report.closed_by && (
                                    <Typography variant="body2" color="text.secondary">por {report.closed_by}</Typography>
                                )}
                            </Grid>
                        )}
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Entregas y cierre</Typography>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    minHeight: 72,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    bgcolor: "warning.light",
                                    color: "warning.contrastText",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="body2">Entrega parcial</Typography>
                                <Typography variant="h6">{formatCurrency(report.partial_cash)}</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    minHeight: 72,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    bgcolor: "success.light",
                                    color: "success.contrastText",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="body2">Entrega cierre</Typography>
                                <Typography variant="h6">{formatCurrency(report.final_cash)}</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    minHeight: 72,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    bgcolor: "action.hover",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">Entregado total</Typography>
                                <Typography variant="h6">{formatCurrency(getReportDeliveriesTotal(report))}</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Box
                                sx={{
                                    p: 2,
                                    minHeight: 72,
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    bgcolor: getReportDifference(report) === 0 ? "success.light" : "error.light",
                                    color: getReportDifference(report) === 0 ? "success.contrastText" : "error.contrastText",
                                    borderRadius: 1,
                                }}
                            >
                                <Typography variant="body2">Diferencia</Typography>
                                <Typography variant="h6">{formatCurrency(getReportDifference(report))}</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Detalle</Typography>
                    <Grid container spacing={2}>
                        {report.partial_closed_at != null && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="body2">Tiquetes vendidos en cierre parcial: {report.partial_tickets}</Typography>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cerrar</Button>
                <Button variant="contained" startIcon={<Print />} onClick={() => { onPrint(report); onClose(); }}>
                    Imprimir
                </Button>
            </DialogActions>
        </Dialog>
    );
}

const LatestReportsTable: React.FC<LatestReportsTableProps> = ({
    latestReports,
    onPrintReport,
}) => {
    const [detailReport, setDetailReport] = useState<models.Report | null>(null);

    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Timeline color="primary" />
                Últimos Reportes
                <Typography variant="body2" color="text.secondary" sx={{ ml: "auto" }}>
                    Ver detalle para estadísticas completas
                </Typography>
            </Typography>

            {!latestReports || latestReports.length === 0 ? (
                <Alert severity="info">No hay reportes anteriores disponibles</Alert>
            ) : (
                <TableContainer component={Paper} variant="outlined" sx={{ overflowX: "auto" }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Usuario</TableCell>
                                <TableCell>Creado</TableCell>
                                <TableCell align="right">Total</TableCell>
                                <TableCell>Estado</TableCell>
                                <TableCell align="center">Acciones</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {latestReports.map((pastReport) => {
                                const status = reportStatus(pastReport);
                                const statusLabel =
                                    status === "closed"
                                        ? "Cerrado"
                                        : status === "pending"
                                        ? "Pendiente"
                                        : "Abierto";
                                const statusColor =
                                    status === "closed" ? "success" : status === "pending" ? "warning" : "default";
                                return (
                                    <TableRow key={pastReport.id} hover>
                                        <TableCell>#{pastReport.id}</TableCell>
                                        <TableCell>{pastReport.username}</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateShort(pastReport.created_at)}</TableCell>
                                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>{formatCurrency(pastReport.total_cash)}</TableCell>
                                        <TableCell>
                                            <Chip label={statusLabel} color={statusColor} size="small" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Ver detalle y estadísticas">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDetailReport(pastReport)}
                                                    color="primary"
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Reimprimir reporte">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onPrintReport(pastReport)}
                                                    color="primary"
                                                >
                                                    <Print />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <ReportDetailDialog
                report={detailReport}
                open={!!detailReport}
                onClose={() => setDetailReport(null)}
                onPrint={onPrintReport}
            />
        </>
    );
};

export default LatestReportsTable;
