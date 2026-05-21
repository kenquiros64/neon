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
import { DirectionsBus, PeopleAlt, StarRounded } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import { models } from '../../wailsjs/go/models';

interface StopListProps {
    stops: models.Stop[];
    selectedStopID: String | null;
    onStopSelect: (id: String) => void;
    getCount: (stop: models.Stop) => number;
    sx?: SxProps<Theme>;
}

export const StopList: React.FC<StopListProps> = ({
    stops,
    selectedStopID,
    onStopSelect,
    getCount,
    sx,
}) => {
    const { theme } = useTheme();

    const getItemStyles = (isSelected: boolean) => ({
        cursor: "pointer",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 14px",
        minHeight: "72px",
        borderRadius: 2,
        margin: "0 8px",
        borderLeft: isSelected
            ? (theme === "light" ? '4px solid rgba(76, 175, 80, 1)' : '4px solid rgba(129, 199, 132, 1)')
            : '4px solid transparent',
        backgroundColor: isSelected
            ? (theme === "light" ? 'rgba(76, 175, 80, 0.08)' : 'rgba(129, 199, 132, 0.08)')
            : 'transparent',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
            backgroundColor: isSelected
                ? (theme === "light" ? 'rgba(76, 175, 80, 0.12)' : 'rgba(129, 199, 132, 0.12)')
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
            ? (theme === "light" ? 'rgba(76, 175, 80, 0.12)' : 'rgba(129, 199, 132, 0.12)')
            : (theme === "light" ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'),
        flexShrink: 0,
    });

    const getPassengerPillStyles = (isSelected: boolean) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        borderRadius: 3,
        px: 1,
        py: 0.5,
        backgroundColor: isSelected
            ? (theme === "light" ? 'rgba(76, 175, 80, 0.12)' : 'rgba(129, 199, 132, 0.12)')
            : (theme === "light" ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.06)'),
        flexShrink: 0,
    });

    return (
        <List sx={[{ p: 0, mt: 1 }, ...(sx ? (Array.isArray(sx) ? sx : [sx]) : [])]}>
            {stops.map((stop) => {
                const isSelected = stop.code === selectedStopID;
                const passengerCount = getCount(stop);

                return (
                    <ListItem key={stop.code} disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                            selected={isSelected}
                            onClick={() => onStopSelect(stop.code)}
                            sx={getItemStyles(isSelected)}
                        >
                            {/* Icon container */}
                            <Box sx={getIconContainerStyles(isSelected)}>
                                <DirectionsBus
                                    fontSize="small"
                                    sx={{ color: isSelected ? 'success.main' : 'action.active' }}
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
                                            color: isSelected ? 'success.main' : 'text.primary',
                                            fontSize: '0.95rem',
                                            lineHeight: 1.3,
                                        }}
                                    >
                                        {stop.name}
                                    </Typography>
                                }
                                secondary={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mt: 0.5, flexWrap: 'wrap' }}>
                                        <Chip
                                            label={stop.code}
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.7rem', height: 20, '& .MuiChip-label': { px: 0.75 } }}
                                        />
                                        {stop.is_main && (
                                            <Chip
                                                icon={<StarRounded sx={{ fontSize: '0.85rem !important' }} />}
                                                label="Principal"
                                                size="small"
                                                color="warning"
                                                sx={{ fontSize: '0.7rem', height: 20, '& .MuiChip-label': { px: 0.5 } }}
                                            />
                                        )}
                                    </Box>
                                }
                                sx={{ ml: 1.5, my: 0 }}
                            />

                            {/* Passenger count pill */}
                            <Box sx={getPassengerPillStyles(isSelected)}>
                                <PeopleAlt
                                    sx={{
                                        fontSize: '1rem',
                                        color: isSelected ? 'success.main' : 'action.active',
                                    }}
                                />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontWeight: 700,
                                        color: isSelected ? 'success.main' : 'text.secondary',
                                        lineHeight: 1,
                                        minWidth: '16px',
                                        textAlign: 'center',
                                    }}
                                >
                                    {Math.min(passengerCount, 99)}
                                </Typography>
                            </Box>
                        </ListItemButton>
                    </ListItem>
                );
            })}
        </List>
    );
};
