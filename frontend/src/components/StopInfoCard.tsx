import React from 'react';
import { Box, Typography } from "@mui/material";
import { DirectionsBus } from "@mui/icons-material";
import { models } from '../../wailsjs/go/models';

interface StopInfoCardProps {
    route: models.Route | null;
    routeIndex?: number;
}

/** Header for the stops panel (timeline lives in StopList). */
export const StopInfoCard: React.FC<StopInfoCardProps> = ({ route, routeIndex = 0 }) => {
    if (!route) return null;

    const routeNumber = (routeIndex + 1) * 10;

    return (
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.25 }}>
                <DirectionsBus sx={{ fontSize: 18, color: 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Paradas
                </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, pl: 3.25 }}>
                Paradas de la Ruta {routeNumber}
            </Typography>
        </Box>
    );
};
