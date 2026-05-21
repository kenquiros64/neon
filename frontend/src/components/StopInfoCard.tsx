import React from 'react';
import { Box, Typography, Chip, Divider } from "@mui/material";
import { DirectionsBus, Star } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import { models } from '../../wailsjs/go/models';

interface StopInfoCardProps {
    stop: models.Stop | null;
    route: models.Route | null;
}

export const StopInfoCard: React.FC<StopInfoCardProps> = ({ stop, route }) => {
    const { theme } = useTheme();

    if (!stop || !route) return null;

    const currentIndex = route.stops.findIndex((s: any) => s.name === stop.name) ?? -1;
    const totalStops = route.stops.length || 0;

    return (
        <Box
            sx={{
                backgroundColor: theme === "light" ? 'rgba(76, 175, 80, 0.06)' : 'rgba(129, 199, 132, 0.06)',
                borderRadius: 0,
                p: 2,
                minHeight: '140px',
                height: '140px',
                borderTop: theme === "light" ? '1px solid rgba(76, 175, 80, 0.15)' : '1px solid rgba(129, 199, 132, 0.15)',
                borderBottom: theme === "light" ? '1px solid rgba(76, 175, 80, 0.15)' : '1px solid rgba(129, 199, 132, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <DirectionsBus color="success" sx={{ fontSize: 16 }} />
                    <Typography variant="overline" color="success.main" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1 }}>
                        Parada Actual
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 0.75 }}>
                    {stop.is_main && (
                        <Chip
                            icon={<Star sx={{ fontSize: '0.8rem !important' }} />}
                            label="Principal"
                            size="small"
                            color="warning"
                            sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.5 } }}
                        />
                    )}
                    {currentIndex !== -1 && totalStops > 0 && (
                        <Chip
                            label={`${currentIndex + 1} / ${totalStops}`}
                            size="small"
                            variant="outlined"
                            sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }}
                        />
                    )}
                </Box>
            </Box>

            <Divider sx={{ opacity: 0.5 }} />

            {/* Content row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                        {stop.name}
                    </Typography>
                    {stop.code && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, mt: 0.25, display: 'block' }}>
                            Código: {stop.code}
                        </Typography>
                    )}
                </Box>

                {/* Fare chips */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5, ml: 2 }}>
                    <Chip
                        label={`₡${stop.gold_fare}`}
                        size="small"
                        color="warning"
                        sx={{ fontWeight: 700, fontSize: '0.8rem', height: 22 }}
                    />
                    <Chip
                        label={`₡${stop.fare}`}
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 700, fontSize: '0.8rem', height: 22 }}
                    />
                </Box>
            </Box>
        </Box>
    );
};
