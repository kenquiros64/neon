import React from 'react';
import { Box, Typography, CardMedia } from "@mui/material";
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
                backgroundColor: theme === "light" ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)', 
                borderRadius: 0, 
                p: 2,
                minHeight: '140px',
                height: '140px',
                border: theme === "light" ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid rgba(144, 202, 249, 0.2)',
                borderLeft: 'none',
                borderRight: 'none',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Route Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RouteIcon color="primary" fontSize="small" />
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                        RUTA ACTIVA
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ 
                    backgroundColor: 'action.hover', 
                    px: 1, 
                    py: 0.3,
                    borderRadius: 1,
                    fontSize: '0.7rem'
                }}>
                    {route.stops?.length || 0} PARADAS
                </Typography>
            </Box>

            {/* Route Content */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {/* Left Side - Route Image */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minWidth: '80px',
                        height: '80px',
                    }}
                >
                    <CardMedia
                        component="img"
                        image={theme === "light" ? routeLight : routeDark}
                        title="route"
                        sx={{
                            height: 'auto',   
                            maxWidth: '70px',
                            objectFit: 'contain',
                        }}
                    />
                </Box>

                {/* Right Side - Route Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                    {/* Departure */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TripOrigin sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Box>
                            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: "400", fontSize: '0.75rem', lineHeight: 1 }}>
                                Salida
                            </Typography>
                            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "700", lineHeight: 1 }}>
                                {route.departure}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Destination */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
                        <Box>
                            <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: "400", fontSize: '0.75rem', lineHeight: 1 }}>
                                Destino
                            </Typography>
                            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "700", lineHeight: 1 }}>
                                {route.destination}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}; 