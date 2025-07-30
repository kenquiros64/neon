import React, { useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
    CircularProgress
} from "@mui/material";
import {
    Warning,
    Cancel,
    Search,
    RotateLeft
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { NullifyTicket } from "../../wailsjs/go/services/TicketService";
import { useReportState } from "../states/ReportState";

interface ReportActionsPanelProps {
    isPendingReport: boolean;
    reportLoading: boolean;
    reportId: number;
    onOpenCloseDialog: (type: 'partial' | 'total') => void;
}

const ReportActionsPanel: React.FC<ReportActionsPanelProps> = ({ 
    isPendingReport, 
    reportLoading, 
    reportId,
    onOpenCloseDialog
}) => {
    const [ticketIDToNull, setTicketIDToNull] = useState<string>('');
    const [nullifyLoading, setNullifyLoading] = useState(false);
    const { checkReportStatus } = useReportState();

    const handleNullifyTicket = async () => {
        const ticketID = parseInt(ticketIDToNull);
        if (!ticketIDToNull || isNaN(ticketID)) {
            toast.error('Por favor ingrese un ID de ticket válido');
            return;
        }

        setNullifyLoading(true);
        try {
            await NullifyTicket(ticketID, reportId);
            toast.success(`Tiquete ${ticketID} marcado como devuelto`);
            setTicketIDToNull('');
            checkReportStatus();
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

    return (
        <>
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
                                onClick={() => onOpenCloseDialog('partial')}
                                disabled={reportLoading}
                            >
                                Cierre Parcial
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<Cancel />}
                            onClick={() => onOpenCloseDialog('total')}
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
        </>
    );
};

export default ReportActionsPanel; 