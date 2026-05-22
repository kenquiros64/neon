import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    InputAdornment,
    Box,
} from "@mui/material";
import { LocalAtm, Warning, Cancel } from "@mui/icons-material";
import { toast } from "react-toastify";
import { formatCurrency, getDepositAmount } from "../util/reportHelpers";
import { models } from "../../wailsjs/go/models";
import { Alert } from "@mui/material";

interface CloseReportDialogProps {
    open: boolean;
    closeType: 'partial' | 'total';
    reportLoading: boolean;
    report: models.Report | null;
    onClose: () => void;
    onCloseReport: (cashAmount: number, type: 'partial' | 'total') => Promise<void>;
}

const CloseReportDialog: React.FC<CloseReportDialogProps> = ({
    open,
    closeType,
    reportLoading,
    report,
    onClose,
    onCloseReport
}) => {
    const depositHint = report ? getDepositAmount(report, closeType) : 0;
    const [finalCash, setFinalCash] = useState<string>('');

    const handleClose = () => {
        setFinalCash('');
        onClose();
    };

    const handleSubmit = async () => {
        const cashAmount = parseFloat(finalCash);
        if (!finalCash || isNaN(cashAmount) || cashAmount < 0) {
            toast.error('Por favor ingrese un monto final válido');
            return;
        }

        try {
            await onCloseReport(Math.round(cashAmount), closeType);
            handleClose();
        } catch (error) {
            console.error('Error closing report:', error);
            toast.error('Error al cerrar el reporte');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ color: closeType === 'partial' ? 'warning.main' : 'error.main', display: 'flex' }}>
                    {closeType === 'partial' ? <Warning /> : <Cancel />}
                </Box>
                {closeType === 'partial' ? 'Cierre Parcial de Reporte' : 'Cierre Total de Reporte'}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {closeType === 'partial' 
                        ? 'El cierre parcial permite continuar vendiendo tiquetes pero registra el estado actual.'
                        : 'El cierre total finaliza completamente el reporte. No se podrán vender más tiquetes.'
                    }
                </Typography>
                {report && depositHint > 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        Efectivo a depositar según ventas del sistema: <strong>{formatCurrency(depositHint)}</strong>.
                        Cuente el efectivo físico e ingrese el monto real abajo.
                    </Alert>
                )}
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
                <Button onClick={handleClose}>
                    Cancelar
                </Button>
                <Button 
                    onClick={handleSubmit} 
                    variant="contained"
                    color={closeType === 'partial' ? 'warning' : 'error'}
                    disabled={reportLoading || !finalCash}
                >
                    {closeType === 'partial' ? 'Cierre Parcial' : 'Cierre Total'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CloseReportDialog; 