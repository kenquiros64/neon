import React from 'react';
import {
    Typography,
    Box,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { DirectionsBus, AccessTime } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import { fullRouteName, nextDeparture, to12HourFormat } from "../util/Helpers";
import { routeBadgeColor } from '../theme/ticketPanelTheme';
import { models } from '../../wailsjs/go/models';

interface RouteListProps {
    routes: models.Route[];
    selectedRouteID: String | null;
    onRouteSelect: (id: String) => void;
    report: models.Report;
    sx?: SxProps<Theme>;
}

export const RouteList: React.FC<RouteListProps> = ({
    routes,
    selectedRouteID,
    onRouteSelect,
    report,
    sx,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const timetable = (report?.timetable as 'regular' | 'holiday') || 'regular';

    return (
        <Box
            sx={[
                {
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    px: 2,
                    pb: 2,
                },
                ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
            ]}
        >
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}
            >
                Rutas Disponibles
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {routes.map((route, index) => {
                    const routeKey = fullRouteName(route);
                    const isSelected = routeKey === selectedRouteID;
                    const badgeColor = routeBadgeColor(index);
                    const routeNumber = (index + 1) * 10;
                    const nextTime = to12HourFormat(nextDeparture(route, timetable));

                    return (
                        <Box
                            key={routeKey}
                            onClick={() => onRouteSelect(routeKey)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.25,
                                p: 1.25,
                                borderRadius: 2,
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: isSelected
                                    ? (isDark ? 'rgba(144, 202, 249, 0.4)' : 'rgba(25, 118, 210, 0.35)')
                                    : 'transparent',
                                bgcolor: isSelected
                                    ? (isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)')
                                    : 'transparent',
                                transition: 'background-color 0.15s, border-color 0.15s',
                                '&:hover': {
                                    bgcolor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: '50%',
                                    bgcolor: badgeColor,
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 800,
                                    fontSize: '0.9rem',
                                    flexShrink: 0,
                                }}
                            >
                                {routeNumber}
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.25 }}>
                                    {route.departure}{' '}
                                    <Typography component="span" color="text.secondary" sx={{ fontWeight: 400 }}>
                                        →
                                    </Typography>{' '}
                                    {route.destination}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                    <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary">
                                        Siguiente: {nextTime}
                                    </Typography>
                                </Box>
                            </Box>

                            <DirectionsBus
                                sx={{
                                    fontSize: 22,
                                    color: isSelected ? 'primary.main' : 'action.disabled',
                                    flexShrink: 0,
                                }}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};
