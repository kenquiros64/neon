import React from 'react';
import { Box, Typography, Chip, CardMedia, Divider } from "@mui/material";
import { Route as RouteIcon, TripOrigin, LocationOn } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import routeLight from "../assets/images/route_light.svg";
import routeDark from "../assets/images/route_dark.svg";
import { models } from '../../wailsjs/go/models';

interface RouteInfoCardProps {
    route: models.Route;
}

export const RouteInfoCard: React.FC<RouteInfoCardProps> = ({ route }) => {
    const { theme } = useTheme();

    if (!route) return null;

    return (
        <Box
            sx={{
                backgroundColor: theme === "light" ? 'rgba(25, 118, 210, 0.06)' : 'rgba(144, 202, 249, 0.06)',
                borderRadius: 0,
                p: 2,
                minHeight: '140px',
                height: '140px',
                borderTop: theme === "light" ? '1px solid rgba(25, 118, 210, 0.15)' : '1px solid rgba(144, 202, 249, 0.15)',
                borderBottom: theme === "light" ? '1px solid rgba(25, 118, 210, 0.15)' : '1px solid rgba(144, 202, 249, 0.15)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header row */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <RouteIcon color="primary" sx={{ fontSize: 16 }} />
                    <Typography variant="overline" color="primary" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1 }}>
                        Ruta Activa
                    </Typography>
                </Box>
                <Chip
                    label={`${route.stops?.length || 0} paradas`}
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ height: 20, fontSize: '0.65rem', '& .MuiChip-label': { px: 0.75 } }}
                />
            </Box>

            <Divider sx={{ opacity: 0.5, mb: 1 }} />

            {/* Content row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: '64px' }}>
                    <CardMedia
                        component="img"
                        image={theme === "light" ? routeLight : routeDark}
                        title="route"
                        sx={{ height: 'auto', maxWidth: '60px', objectFit: 'contain' }}
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, gap: 0.75 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TripOrigin sx={{ fontSize: 14, color: 'text.secondary' }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 400, lineHeight: 1, display: 'block' }}>
                                Salida
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700, lineHeight: 1.1 }}>
                                {route.departure}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn sx={{ fontSize: 14, color: 'primary.main' }} />
                        <Box>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 400, lineHeight: 1, display: 'block' }}>
                                Destino
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700, lineHeight: 1.1 }}>
                                {route.destination}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
