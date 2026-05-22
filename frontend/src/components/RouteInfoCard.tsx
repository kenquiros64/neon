import React from 'react';
import { Box, Typography, Chip } from "@mui/material";
import { Route as RouteIcon, DirectionsBus } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import { models } from '../../wailsjs/go/models';
import { routeBadgeColor } from '../theme/ticketPanelTheme';

interface RouteInfoCardProps {
    route: models.Route;
    routeIndex?: number;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({ route, routeIndex = 0 }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const badgeColor = routeBadgeColor(routeIndex);
    const routeNumber = (routeIndex + 1) * 10;

    if (!route) return null;

    return (
        <Box sx={{ px: 2, pt: 2, pb: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.5 }}>
                <RouteIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    Ruta Activa
                </Typography>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: isDark ? 'rgba(144, 202, 249, 0.35)' : 'rgba(25, 118, 210, 0.25)',
                    bgcolor: isDark ? 'rgba(25, 118, 210, 0.12)' : 'rgba(25, 118, 210, 0.06)',
                }}
            >
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: badgeColor,
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '1rem',
                        flexShrink: 0,
                    }}
                >
                    {routeNumber}
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        Ruta {routeNumber}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                        {route.departure} → {route.destination}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                    <Chip
                        label="ACTIVA"
                        size="small"
                        sx={{
                            height: 22,
                            fontWeight: 800,
                            fontSize: '0.65rem',
                            bgcolor: 'success.main',
                            color: 'success.contrastText',
                            '& .MuiChip-label': { px: 1 },
                        }}
                    />
                    <DirectionsBus sx={{ fontSize: 20, color: 'primary.main', opacity: 0.85 }} />
                </Box>
            </Box>
        </Box>
    );
};
