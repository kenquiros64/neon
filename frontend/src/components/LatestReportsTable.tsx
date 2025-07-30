import React from "react";
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
    Tooltip
} from "@mui/material";
import { Timeline, Print } from "@mui/icons-material";
import { models } from "../../wailsjs/go/models";

interface LatestReportsTableProps {
    latestReports: models.Report[];
    onPrintReport: (report: models.Report) => void;
}

const LatestReportsTable: React.FC<LatestReportsTableProps> = ({ 
    latestReports, 
    onPrintReport 
}) => {
    const formatCurrency = (amount: number) => {
        return `₡${amount.toLocaleString()}`;
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('es-CR');
    };

    return (
        <>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Timeline color="primary" />
                Últimos Reportes
                <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
                    Para reimprimir reportes anteriores
                </Typography>
            </Typography>
            
            {!latestReports || latestReports.length === 0 ? (
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
                                <TableCell>Horario</TableCell>
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
                                    <TableCell>
                                        <Chip
                                            label={pastReport.timetable === "regular" ? 'Regular' : 'Feriado'}
                                            color={pastReport.timetable === "regular" ? 'primary' : 'success'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="center">
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
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </>
    );
};

export default LatestReportsTable; 