import React from 'react';
import { Box, Typography } from "@mui/material";
import { DirectionsBus, Star, LocalAtm } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";

interface StopInfoCardProps {
    stop: any; // Replace with proper Stop type
    route: any; // Replace with proper Route type
}

export const StopInfoCard: React.FC<StopInfoCardProps> = ({ stop, route }) => {
    const { theme } = useTheme();

    if (!stop || !route) return null;

    const currentIndex = route.stops?.findIndex((s: any) => s.name === stop.name) ?? -1;
    const totalStops = route.stops?.length || 0;

    return (
        <Box
            sx={{
                backgroundColor: theme === "light" ? 'rgba(76, 175, 80, 0.08)' : 'rgba(129, 199, 132, 0.08)', 
                borderRadius: 0, 
                p: 2,
                minHeight: '140px',
                height: '140px',
                border: theme === "light" ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(129, 199, 132, 0.2)',
                borderLeft: 'none',
                borderRight: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* Stop Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DirectionsBus color="success" fontSize="small" />
                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        PARADA ACTUAL
                    </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {stop.is_main && (
                        <Typography variant="body2" color="warning.main" sx={{ 
                            backgroundColor: 'rgba(255, 193, 7, 0.1)', 
                            px: 1, 
                            py: 0.3, 
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                        }}>
                            <Star sx={{ fontSize: 12 }} />
                            PRINCIPAL
                        </Typography>
                    )}
                    
                    {currentIndex !== -1 && totalStops > 0 && (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                            backgroundColor: 'action.hover', 
                            px: 1, 
                            py: 0.3, 
                            borderRadius: 1,
                            fontSize: '0.7rem'
                        }}>
                            {currentIndex + 1} DE {totalStops}
                        </Typography>
                    )}
                </Box>
            </Box>

            {/* Stop Content */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                {/* Stop Name and Code */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                        {stop.name}
                    </Typography>
                    {stop.code && (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                            fontWeight: 500, 
                            mt: 0.5,
                            opacity: 0.8
                        }}>
                            Código: {stop.code}
                        </Typography>
                    )}
                </Box>

                {/* Fare Preview */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'flex-end',
                    gap: 0.5,
                    ml: 2
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalAtm sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Tarifas
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Typography variant="body2" sx={{ 
                            color: '#FBC02D', 
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            ₡{stop.gold_fare}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                            color: 'secondary.main', 
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}>
                            ₡{stop.fare}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}; 