import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Typography,
    Box,
    Chip,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { AltRoute, AccessTime } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import { fullRouteName, nextDeparture, to12HourFormat } from "../util/Helpers";
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

    const getItemStyles = (isSelected: boolean) => ({
        cursor: "pointer",
        padding: "10px 14px",
        minHeight: "72px",
        display: "flex",
        alignItems: "center",
        borderRadius: 2,
        margin: "0 8px",
        borderLeft: isSelected
            ? (theme === "light" ? '4px solid rgba(25, 118, 210, 1)' : '4px solid rgba(144, 202, 249, 1)')
            : '4px solid transparent',
        backgroundColor: isSelected
            ? (theme === "light" ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)')
            : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: isSelected
                ? (theme === "light" ? 'rgba(25, 118, 210, 0.12)' : 'rgba(144, 202, 249, 0.12)')
                : (theme === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'),
            transform: 'translateY(-1px)',
            boxShadow: theme === "light"
                ? '0 4px 12px rgba(0, 0, 0, 0.08)'
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
    });

    const getIconContainerStyles = (isSelected: boolean) => ({
        width: 40,
        height: 40,
        borderRadius: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isSelected
            ? (theme === "light" ? 'rgba(25, 118, 210, 0.12)' : 'rgba(144, 202, 249, 0.12)')
            : (theme === "light" ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'),
        flexShrink: 0,
    });

    return (
        <List sx={[{ p: 0, mt: 1 }, ...(sx ? (Array.isArray(sx) ? sx : [sx]) : [])]}>
            {routes.map((route) => {
                const routeKey = fullRouteName(route);
                const isSelected = routeKey === selectedRouteID;

                return (
                    <ListItem key={routeKey} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={isSelected}
                            onClick={() => onRouteSelect(routeKey)}
                            sx={getItemStyles(isSelected)}
                        >
                            {/* Icon container */}
                            <Box sx={getIconContainerStyles(isSelected)}>
                                <AltRoute
                                    fontSize="small"
                                    sx={{ color: isSelected ? 'primary.main' : 'action.active' }}
                                />
                            </Box>

                            {/* Text content */}
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="subtitle2"
                                        component="span"
                                        sx={{
                                            fontWeight: 700,
                                            color: isSelected ? 'primary.main' : 'text.primary',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {fullRouteName(route)}
                                    </Typography>
                                }
                                secondary={
                                    <Box sx={{ mt: 0.5 }}>
                                        <Chip
                                            icon={<AccessTime sx={{ fontSize: '0.8rem !important' }} />}
                                            label={to12HourFormat(nextDeparture(route, (report?.timetable as 'regular' | 'holiday') || "regular"))}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 20, '& .MuiChip-label': { px: 0.5 } }}
                                        />
                                    </Box>
                                }
                                sx={{ ml: 1.5, my: 0 }}
                            />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};
