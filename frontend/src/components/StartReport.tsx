import React, { useState } from 'react';
import { useReportState } from '../states/ReportState';
import {
    Button,
    CardContent,
    Card,
    Typography,
    Box,
    CardActions,
    Alert,
    CircularProgress,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Paper,
    Divider,
} from '@mui/material';
import { useAuthState } from "../states/AuthState";
import { Receipt, TrendingUp, Schedule, Celebration } from '@mui/icons-material';
import { toast } from 'react-toastify';

const StartReport: React.FC = () => {
    const { startReport, reportLoading } = useReportState();
    const { user } = useAuthState();
    const [selectedTimetable, setSelectedTimetable] = useState<'regular' | 'holiday'>('regular');

    const handleTimetableChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedTimetable(event.target.value as 'regular' | 'holiday');
    };

    const handleStartReport = async () => {
        if (!user?.username) {
            toast.error('Usuario no válido');
            return;
        }
        startReport(user.username, selectedTimetable).then(() => {
            toast.success('Reporte iniciado exitosamente');
        }).catch((error) => {
            console.error('Error starting report:', error);
            toast.error('Error al iniciar el reporte');
        });
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
                bgcolor: 'rgba(0,0,0,0.04)',
            }}
        >
            <Card
                variant="outlined"
                sx={{
                    minWidth: 400,
                    maxWidth: 480,
                    borderTop: '3px solid',
                    borderTopColor: 'primary.main',
                }}
            >
                <CardContent sx={{ p: 3 }}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                        <Receipt sx={{ fontSize: 28, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="overline" color="primary" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1 }}>
                                Nuevo Reporte
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                Iniciar Jornada
                            </Typography>
                        </Box>
                    </Box>

                    <Alert severity="warning" sx={{ mb: 2.5, fontSize: '0.85rem' }}>
                        No hay un reporte activo. Inicie uno para poder vender tiquetes.
                    </Alert>

                    {/* Timetable selection — selectable cards */}
                    <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem', display: 'block', mb: 1 }}>
                        Tipo de Horario
                    </Typography>
                    <FormControl fullWidth>
                        <RadioGroup
                            value={selectedTimetable}
                            onChange={handleTimetableChange}
                            sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}
                        >
                            {[
                                { value: 'regular', label: 'Regular', icon: <Schedule sx={{ fontSize: 18, color: 'primary.main' }} />, color: 'primary.main' },
                                { value: 'holiday', label: 'Feriado', icon: <Celebration sx={{ fontSize: 18, color: 'success.main' }} />, color: 'success.main' },
                            ].map(({ value, label, icon, color }) => {
                                const isSelected = selectedTimetable === value;
                                return (
                                    <Paper
                                        key={value}
                                        variant="outlined"
                                        onClick={() => setSelectedTimetable(value as 'regular' | 'holiday')}
                                        sx={{
                                            flex: 1,
                                            p: 1.5,
                                            cursor: 'pointer',
                                            borderWidth: isSelected ? 2 : 1,
                                            borderColor: isSelected ? color : 'divider',
                                            borderRadius: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <FormControlLabel
                                            value={value}
                                            control={<Radio size="small" sx={{ p: 0 }} />}
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, ml: 0.5 }}>
                                                    {icon}
                                                    <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 400 }}>
                                                        {label}
                                                    </Typography>
                                                </Box>
                                            }
                                            sx={{ m: 0 }}
                                        />
                                    </Paper>
                                );
                            })}
                        </RadioGroup>
                    </FormControl>

                    <Divider sx={{ my: 2.5 }} />

                    <Alert severity="info" icon={false} sx={{ fontSize: '0.8rem' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
                            ¿Qué sucede al iniciar?
                        </Typography>
                        • Se habilita la venta de tiquetes<br />
                        • Se inicia el seguimiento de transacciones<br />
                        • Se pueden generar reportes de actividad
                    </Alert>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3 }}>
                    <Button
                        onClick={handleStartReport}
                        color="primary"
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={reportLoading}
                        startIcon={reportLoading ? <CircularProgress size={18} /> : <TrendingUp />}
                        sx={{ py: 1.5, fontWeight: 700 }}
                    >
                        {reportLoading ? 'Iniciando Reporte...' : 'Iniciar Reporte'}
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default StartReport;
