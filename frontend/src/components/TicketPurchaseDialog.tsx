import React, { useState, useEffect, useRef } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Divider,
    Paper,
    Grid,
    InputAdornment,
    Chip
} from '@mui/material';
import {
    Close,
    Add,
    Remove,
    ConfirmationNumber,
    Schedule,
    DirectionsBus,
    LocationOn,
    Person,
    Star,
    LocalAtm
} from '@mui/icons-material';
import { useTheme } from '../themes/ThemeProvider';
import { to12HourFormat } from '../util/Helpers';
import { models } from '../../wailsjs/go/models';

interface TicketPurchaseDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (quantity: number, idNumber?: string) => void;
    ticketType: 'regular' | 'gold';
    route: models.Route | null;
    stop: models.Stop | null;
    selectedTime: models.Time;
}

const TicketPurchaseDialog: React.FC<TicketPurchaseDialogProps> = ({
    open,
    onClose,
    onConfirm,
    ticketType,
    route,
    stop,
    selectedTime
}) => {
    const { theme } = useTheme();
    const [quantity, setQuantity] = useState(1);
    const [idNumber, setIdNumber] = useState('');
    const quantityRef = useRef<HTMLInputElement>(null);
    const idRef = useRef<HTMLInputElement>(null);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (open) {
            setQuantity(1);
            setIdNumber('');
            // Focus appropriate field after dialog is open
            setTimeout(() => {
                if (ticketType === 'gold') {
                    idRef.current?.focus();
                }
            }, 100);
        }
    }, [open, ticketType]);

    const handleQuantityChange = (value: string) => {
        const numValue = parseInt(value) || 1;
        if (numValue >= 1 && numValue <= 99) {
            setQuantity(numValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Check if focus is on ID number input - if so, don't intercept number keys
        const isIDInputFocused = document.activeElement === idRef.current;
        
        // Allow numbers to directly set quantity only if NOT typing in ID field
        if (e.key >= '1' && e.key <= '9' && !isIDInputFocused) {
            const num = parseInt(e.key);
            if (ticketType === 'regular') {
                setQuantity(num);
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            // If ID input is focused, remove focus first (allows user to press Enter again to confirm)
            if (isIDInputFocused) {
                idRef.current?.blur();
            } else {
                handleConfirm();
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            onClose();
        } else if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            setQuantity(Math.min(99, quantity + 1));
        } else if (e.key === '-') {
            e.preventDefault();
            setQuantity(Math.max(1, quantity - 1));
        }
    };

    const handleConfirm = () => {
        // Validate gold ticket requirements
        if (ticketType === 'gold' && !idNumber.trim()) {
            idRef.current?.focus();
            return;
        }
        
        onConfirm(quantity, ticketType === 'gold' ? idNumber : undefined);
        onClose();
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const totalAmount = () => {
        if (!stop) return 0;
        const fare = ticketType === 'gold' ? stop.gold_fare : stop.fare;
        return fare * quantity;
    };

    if (!route || !stop) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            onKeyDown={handleKeyDown}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: 3,
                        boxShadow: theme === 'light' 
                            ? '0 24px 48px rgba(0, 0, 0, 0.15), 0 8px 16px rgba(0, 0, 0, 0.1)'
                            : '0 24px 48px rgba(0, 0, 0, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2)',
                        minHeight: '400px'
                    }
                },
                backdrop: {
                    sx: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }
                }
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ConfirmationNumber 
                            color={ticketType === 'gold' ? 'warning' : 'primary'} 
                            fontSize="large" 
                        />
                        <Box>
                            <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
                                Venta de Boleto
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <Chip
                                    icon={ticketType === 'gold' ? <Star /> : <ConfirmationNumber />}
                                    label={ticketType === 'gold' ? 'BOLETO ORO' : 'BOLETO REGULAR'}
                                    color={ticketType === 'gold' ? 'warning' : 'primary'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                        </Box>
                    </Box>
                    <IconButton onClick={onClose} size="large">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
                {/* Ticket Information Card */}
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: 3, 
                        mb: 3, 
                        borderRadius: 2,
                        backgroundColor: theme === 'light' 
                            ? 'rgba(25, 118, 210, 0.05)' 
                            : 'rgba(144, 202, 249, 0.05)',
                        border: theme === 'light' 
                            ? '1px solid rgba(25, 118, 210, 0.1)' 
                            : '1px solid rgba(144, 202, 249, 0.1)'
                    }}
                >
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                        Información del Boleto
                    </Typography>
                    
                    <Grid container spacing={2}>
                        <Grid size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <DirectionsBus color="primary" fontSize="small" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        Ruta
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {route.departure} → {route.destination}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        
                        <Grid size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                                <LocationOn color="success" fontSize="small" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        Parada
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {stop.name}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        
                        <Grid size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Schedule color="info" fontSize="small" />
                                <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                        Hora de Salida
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                        {to12HourFormat(selectedTime)}
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                        
                        <Grid size={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                    📅 Fecha
                                </Typography>
                            </Box>
                            <Typography variant="body1" sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
                                {getCurrentDate()}
                            </Typography>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Purchase Details */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        Detalles de Compra
                    </Typography>

                    {/* ID Number Input for Gold Tickets */}
                    {ticketType === 'gold' && (
                        <TextField
                            fullWidth
                            label="Número de Cédula"
                            placeholder="Ingrese el número de cédula"
                            value={idNumber}
                            onChange={(e) => setIdNumber(e.target.value)}
                            inputRef={idRef}
                            required
                            sx={{ mb: 2 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                            helperText="Requerido para boletos oro"
                        />
                    )}

                    {/* Quantity Selector */}
                    {ticketType === 'regular' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 'fit-content' }}>
                                Cantidad:
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <IconButton 
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    size="small"
                                    disabled={quantity <= 1}
                                >
                                    <Remove />
                                </IconButton>
                                <TextField
                                    value={quantity}
                                    onChange={(e) => handleQuantityChange(e.target.value)}
                                    inputRef={quantityRef}
                                    sx={{ width: '80px' }}
                                    slotProps={{
                                        input: {
                                            style: { textAlign: 'center', fontWeight: 600, fontSize: '1.1rem' },
                                            inputProps: {
                                                min: 1,
                                                max: 99
                                            }
                                        }
                                    }}
                                    type="number"
                                />
                                <IconButton 
                                    onClick={() => setQuantity(Math.min(99, quantity + 1))}
                                    size="small"
                                    disabled={quantity >= 99}
                                >
                                    <Add />
                                </IconButton>
                            </Box>
                        </Box>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Total Amount */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Total a Pagar:
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocalAtm color="success" />
                            <Typography 
                                variant="h5" 
                                color="success.main" 
                                sx={{ fontWeight: 700 }}
                            >
                                ₡{totalAmount().toLocaleString()}
                            </Typography>
                        </Box>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {quantity} boleto{quantity > 1 ? 's' : ''} × ₡{ticketType === 'gold' ? stop.gold_fare : stop.fare}
                    </Typography>
                </Box>

                {/* Keyboard Shortcuts Help */}
                <Paper 
                    elevation={1} 
                    sx={{ 
                        p: 2, 
                        backgroundColor: 'action.hover',
                        borderRadius: 1
                    }}
                >
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                        Atajos de Teclado:
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        • Números 1-9: Cambiar cantidad (cuando no esté escribiendo cédula) • +/-: Aumentar/Reducir • Enter: Confirmar • Esc: Cancelar
                    </Typography>
                </Paper>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined" 
                    size="large"
                    sx={{ minWidth: '120px' }}
                >
                    Cancelar
                </Button>
                <Button 
                    onClick={handleConfirm}
                    variant="contained"
                    size="large"
                    disabled={ticketType === 'gold' && !idNumber.trim()}
                    sx={{ 
                        minWidth: '120px',
                        backgroundColor: ticketType === 'gold' ? 'warning.main' : 'primary.main',
                        '&:hover': {
                            backgroundColor: ticketType === 'gold' ? 'warning.dark' : 'primary.dark'
                        }
                    }}
                >
                    Confirmar Venta
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default TicketPurchaseDialog; 