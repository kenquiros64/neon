import React, { useState, useEffect } from 'react';
import { useReportState } from '../states/ReportState';
import {
    Button,
    CardContent,
    Card,
    Typography,
    Box,
    CardActions,
    TextField,
    Alert,
    CircularProgress,
    InputAdornment,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio
} from '@mui/material';
import { useAuthState } from "../states/AuthState";
import { Receipt, TrendingUp, Schedule, Celebration } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useTheme } from '../themes/ThemeProvider';

const StartReport: React.FC = () => {
    const { startReport, reportLoading } = useReportState();
    const { user } = useAuthState();
    const { theme } = useTheme();
    const [selectedTimetable, setSelectedTimetable] = useState<'regular' | 'holiday'>('regular');

    const handleTimetableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTimetable(event.target.value as 'regular' | 'holiday');
    };

    const handleStartReport = async () => {

        if (!user.username) {
            toast.error('Usuario no válido');
            return;
        }

        try {
            const newReport = await startReport(user.username, selectedTimetable);
            toast.success('Reporte iniciado exitosamente');
        } catch (error) {
            console.error('Error starting report:', error);
            toast.error('Error al iniciar el reporte');
        }
    };

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: theme === "light" ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.02)',
            }}
        >
            <Card
                sx={{
                    minWidth: 400,
                    maxWidth: 500,
                    boxShadow: theme === "light" ? '0 4px 12px rgba(0, 0, 0, 0.1)' : '0 4px 12px rgba(0, 0, 0, 0.3)',
                    borderRadius: 2,
                    border: theme === "light" ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid rgba(144, 202, 249, 0.2)',
                    backgroundColor: theme === "light" ? '#ffffff' : 'background.paper',
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* Header Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 3,
                        p: 2,
                        backgroundColor: theme === "light" ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)',
                        borderRadius: 1,
                        border: theme === "light" ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid rgba(144, 202, 249, 0.2)',
                    }}>
                        <Receipt sx={{ fontSize: 32, color: 'primary.main', mr: 2 }} />
                        <Box>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                NUEVO REPORTE
                            </Typography>
                            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "700", lineHeight: 1 }}>
                                Iniciar Jornada
                            </Typography>
                        </Box>
                    </Box>

                    {/* Status Alert */}
                    <Box sx={{ 
                        p: 2, 
                        backgroundColor: theme === "light" ? 'rgba(237, 108, 2, 0.08)' : 'rgba(255, 167, 38, 0.08)',
                        borderRadius: 1,
                        border: theme === "light" ? '1px solid rgba(237, 108, 2, 0.2)' : '1px solid rgba(255, 167, 38, 0.2)',
                        mb: 3
                    }}>
                        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            ESTADO ACTUAL
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, fontSize: '0.85rem' }}>
                            No hay un reporte activo. Necesita iniciar uno para vender tickets.
                        </Typography>
                    </Box>

                    {/* Timetable Selection */}
                    <Box sx={{ 
                        p: 2, 
                        backgroundColor: theme === "light" ? 'rgba(76, 175, 80, 0.08)' : 'rgba(129, 199, 132, 0.08)',
                        borderRadius: 1,
                        border: theme === "light" ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(129, 199, 132, 0.2)',
                        mb: 3
                    }}>
                        <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, fontSize: '0.75rem', mb: 2 }}>
                            TIPO DE HORARIO
                        </Typography>
                        <FormControl>
                            <RadioGroup
                                row
                                value={selectedTimetable}
                                onChange={handleTimetableChange}
                                sx={{ gap: 2 }}
                            >
                                <FormControlLabel 
                                    value="regular" 
                                    control={<Radio size="small" />} 
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Schedule sx={{ fontSize: 16, color: 'primary.main' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Regular
                                            </Typography>
                                        </Box>
                                    }
                                />
                                <FormControlLabel 
                                    value="holiday" 
                                    control={<Radio size="small" />} 
                                    label={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Celebration sx={{ fontSize: 16, color: 'secondary.main' }} />
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                Feriado
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>

                    {/* Info Section */}
                    <Box sx={{ 
                        p: 2, 
                        backgroundColor: theme === "light" ? 'rgba(2, 136, 209, 0.08)' : 'rgba(41, 182, 246, 0.08)',
                        borderRadius: 1,
                        border: theme === "light" ? '1px solid rgba(2, 136, 209, 0.2)' : '1px solid rgba(41, 182, 246, 0.2)',
                        mb: 3
                    }}>
                        <Typography variant="body2" color="info.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            ¿QUÉ SUCEDE AL INICIAR?
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", fontSize: '0.8rem', mt: 1, lineHeight: 1.4 }}>
                            • Se registra el monto inicial en efectivo<br />
                            • Se habilita la venta de tiquetes<br />
                            • Se inicia el seguimiento de transacciones<br />
                            • Se pueden generar reportes de actividad
                        </Typography>
                    </Box>
                </CardContent>
                
                <CardActions sx={{ px: 3, pb: 3 }}>
                    <Button 
                        onClick={handleStartReport} 
                        color="primary"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={reportLoading}
                        startIcon={reportLoading ? <CircularProgress size={20} /> : <TrendingUp />}
                        sx={{
                            py: 1.5,
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: 1,
                            boxShadow: theme === "light" 
                                ? '0 2px 8px rgba(25, 118, 210, 0.2)' 
                                : '0 2px 8px rgba(144, 202, 249, 0.2)',
                            '&:hover': {
                                boxShadow: theme === "light" 
                                    ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                                    : '0 4px 12px rgba(144, 202, 249, 0.3)',
                                transform: 'translateY(-1px)',
                            },
                        }}
                    >
                        {reportLoading ? 'Iniciando Reporte...' : 'Iniciar Reporte'}
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default StartReport;