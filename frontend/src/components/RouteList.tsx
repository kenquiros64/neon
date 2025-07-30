import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography
} from "@mui/material";
import { useTheme } from "../themes/ThemeProvider";
import { fullRouteName, nextDeparture, to12HourFormat } from "../util/Helpers";
import routeList from "../assets/images/map.png";
import { models } from '../../wailsjs/go/models';

interface RouteListProps {
    routes: models.Route[];
    selectedRouteID: String | null;
    onRouteSelect: (id: String) => void;
    report: models.Report; 
}

export const RouteList: React.FC<RouteListProps> = ({
    routes,
    selectedRouteID,
    onRouteSelect,
    report
}) => {
    const { theme } = useTheme();

    const getItemStyles = (routeKey: String, isSelected: boolean) => ({
        cursor: "pointer",
        padding: "18px 20px", 
        minHeight: "80px",
        display: "flex",
        alignItems: "center",
        borderRadius: 2,
        margin: "0 8px",
        backgroundColor: isSelected 
            ? (theme === "light" ? 'rgba(25, 118, 210, 0.12)' : 'rgba(144, 202, 249, 0.12)')
            : 'transparent',
        border: isSelected 
            ? (theme === "light" ? '2px solid rgba(25, 118, 210, 0.3)' : '2px solid rgba(144, 202, 249, 0.3)')
            : '2px solid transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: isSelected 
                ? (theme === "light" ? 'rgba(25, 118, 210, 0.16)' : 'rgba(144, 202, 249, 0.16)')
                : (theme === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'),
            transform: 'translateY(-1px)',
            boxShadow: theme === "light" 
                ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        boxShadow: isSelected 
            ? (theme === "light" ? '0 2px 8px rgba(25, 118, 210, 0.2)' : '0 2px 8px rgba(144, 202, 249, 0.2)')
            : 'none',
    });

    const getAvatarStyles = (isSelected: boolean) => ({
        width: 56, 
        height: 56,
        borderRadius: 2,
        border: isSelected 
            ? (theme === "light" ? '2px solid rgba(25, 118, 210, 0.3)' : '2px solid rgba(144, 202, 249, 0.3)')
            : '2px solid transparent',
    });

    return (
        <List sx={{ p: 0, mt: 1 }}>
            {routes.map((route) => {
                const routeKey = fullRouteName(route);
                const isSelected = routeKey === selectedRouteID;
                
                return (
                    <ListItem key={routeKey} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            key={routeKey}
                            selected={isSelected}
                            onClick={() => onRouteSelect(routeKey)}
                            sx={getItemStyles(routeKey, isSelected)}
                        >
                            <ListItemAvatar>
                                <Avatar
                                    variant="rounded"
                                    src={routeList}
                                    sx={getAvatarStyles(isSelected)}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="subtitle1" 
                                        component="span"  
                                        sx={{ 
                                            fontWeight: 700,
                                            color: isSelected 
                                                ? 'primary.main' 
                                                : 'text.primary',
                                            fontSize: '1.1rem',
                                        }}
                                    >
                                        {fullRouteName(route)}
                                    </Typography>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.9rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        🕐 Siguiente: {to12HourFormat(nextDeparture(route, (report?.timetable as 'regular' | 'holiday') || "regular"))}
                                    </Typography>
                                }
                                sx={{
                                    marginLeft: 2,
                                }}
                            />
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
}; 