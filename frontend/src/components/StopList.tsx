import React from 'react';
import {
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    Avatar,
    Typography,
    Badge,
    Box
} from "@mui/material";
import { People } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import stopList from "../assets/images/stop_list.svg";
import { models } from '../../wailsjs/go/models';

interface StopListProps {
    stops: models.Stop[]; 
    selectedStopID: String | null;
    onStopSelect: (id: String) => void;
    getCount: (stop: models.Stop) => number;
}

export const StopList: React.FC<StopListProps> = ({
    stops,
    selectedStopID,
    onStopSelect,
    getCount
}) => {
    const { theme } = useTheme();

    const getItemStyles = (isSelected: boolean) => ({
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between", 
        alignItems: "center", 
        padding: "18px 20px",
        minHeight: "80px",
        borderRadius: 2,
        margin: "0 8px",
        backgroundColor: isSelected 
            ? (theme === "light" ? 'rgba(76, 175, 80, 0.12)' : 'rgba(129, 199, 132, 0.12)')
            : 'transparent',
        border: isSelected 
            ? (theme === "light" ? '2px solid rgba(76, 175, 80, 0.3)' : '2px solid rgba(129, 199, 132, 0.3)')
            : '2px solid transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: isSelected 
                ? (theme === "light" ? 'rgba(76, 175, 80, 0.16)' : 'rgba(129, 199, 132, 0.16)')
                : (theme === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'),
            transform: 'translateY(-1px)',
            boxShadow: theme === "light" 
                ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                : '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        boxShadow: isSelected 
            ? (theme === "light" ? '0 2px 8px rgba(76, 175, 80, 0.2)' : '0 2px 8px rgba(129, 199, 132, 0.2)')
            : 'none',
    });

    const getAvatarStyles = (isSelected: boolean) => ({
        width: 56, 
        height: 56,
        borderRadius: 2,
        border: isSelected 
            ? (theme === "light" ? '2px solid rgba(76, 175, 80, 0.3)' : '2px solid rgba(129, 199, 132, 0.3)')
            : '2px solid transparent',
    });

    const getBadgeStyles = (isSelected: boolean) => ({
        "& .MuiBadge-badge": {
            backgroundColor: isSelected ? 'success.main' : 'secondary.main',
            color: "#fff",
            minWidth: "28px",
            height: "28px",
            fontSize: "14px",
            fontWeight: 700,
            borderRadius: "50%",
            lineHeight: "20px",
            padding: "0",
            border: '2px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        },
        mr: 2,
    });

    return (
        <List sx={{ p: 0, mt: 1 }}>
            {stops.map((stop) => {
                const isSelected = stop.code === selectedStopID;
                const passengerCount = getCount(stop);
                
                return (
                    <ListItem key={stop.code} disablePadding sx={{ mb: 1 }}>
                        <ListItemButton
                            key={stop.code}
                            selected={isSelected}
                            onClick={() => onStopSelect(stop.code)}
                            sx={getItemStyles(isSelected)}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                                <ListItemAvatar>
                                    <Avatar
                                        variant="rounded"
                                        src={stopList}
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
                                                    ? 'success.main' 
                                                    : 'text.primary',
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            {stop.name}
                                            {stop.is_main && (
                                                <Typography 
                                                    component="span" 
                                                    sx={{ 
                                                        ml: 1, 
                                                        color: '#FBC02D', 
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    ⭐
                                                </Typography>
                                            )}
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
                                            📍 Código: <Typography component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {stop.code}
                                            </Typography>
                                        </Typography>
                                    }
                                    sx={{
                                        marginLeft: 2, 
                                    }}
                                />
                            </Box>
                            
                            {/* Passenger Count Badge */}
                            <Badge
                                showZero
                                color="secondary"
                                badgeContent={passengerCount}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                max={99}
                                sx={getBadgeStyles(isSelected)}
                            >
                                <People 
                                    fontSize="large" 
                                    sx={{ 
                                        color: isSelected ? 'success.main' : 'action.active',
                                        fontSize: '2rem'
                                    }}
                                />
                            </Badge>
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
}; 