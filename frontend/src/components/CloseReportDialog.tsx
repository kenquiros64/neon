import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    InputAdornment
} from "@mui/material";
import { LocalAtm } from "@mui/icons-material";
import { toast } from "react-toastify";

interface CloseReportDialogProps {
    open: boolean;
    closeType: 'partial' | 'total';
    reportLoading: boolean;
    onClose: () => void;
    onCloseReport: (cashAmount: number, type: 'partial' | 'total') => Promise<void>;
}

const CloseReportDialog: React.FC<CloseReportDialogProps> = ({
    open,
    closeType,
    reportLoading,
    onClose,
    onCloseReport
}) => {
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