import React, { useMemo } from 'react';
import {
    Typography,
    Box,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import { People } from "@mui/icons-material";
import { useTheme } from "../themes/ThemeProvider";
import { useTicketState } from '../states/TicketState';
import { generateCounterKey } from '../util/Helpers';
import { models } from '../../wailsjs/go/models';

function stopPassengerCount(
    stop: models.Stop,
    route: models.Route,
    time: models.Time,
    routeTimeCounts: Record<string, number>
): number {
    const regular =
        routeTimeCounts[generateCounterKey(route, stop, time, false)] ?? 0;
    const gold =
        routeTimeCounts[generateCounterKey(route, stop, time, true)] ?? 0;
    return regular + gold;
}

interface StopListProps {
    stops: models.Stop[];
    selectedStopID: String | null;
    onStopSelect: (id: String) => void;
    sx?: SxProps<Theme>;
}

function TimelineMarker({
    index,
    total,
    isSelected,
}: {
    index: number;
    total: number;
    isSelected: boolean;
}) {
    const isFirst = index === 0;
    const isLast = index === total - 1;

    let borderColor = 'primary.main';
    let bgcolor = 'transparent';
    let innerDot: string | null = null;

    if (isFirst) {
        bgcolor = 'primary.main';
        innerDot = '#fff';
    } else if (isLast) {
        borderColor = 'success.main';
        bgcolor = 'success.main';
        innerDot = '#fff';
    } else if (isSelected) {
        borderColor = 'primary.light';
        bgcolor = 'primary.main';
        innerDot = '#fff';
    }

    return (
        <Box
            sx={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                border: '3px solid',
                borderColor,
                bgcolor,
                flexShrink: 0,
                zIndex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
            }}
        >
            {innerDot && (
                <Box
                    sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: innerDot,
                    }}
                />
            )}
        </Box>
    );
}

export const StopList: React.FC<StopListProps> = ({
    stops,
    selectedStopID,
    onStopSelect,
    sx,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const routeTimeCounts = useTicketState((state) => state.routeTimeCounts);
    const selectedTime = useTicketState((state) => state.selectedTime);
    const selectedRoute = useTicketState((state) => state.selectedRoute);

    const passengerCounts = useMemo(
        () =>
            stops.map((stop) =>
                stopPassengerCount(stop, selectedRoute, selectedTime, routeTimeCounts)
            ),
        [stops, selectedRoute, selectedTime, routeTimeCounts]
    );

    const totalPassengers = useMemo(
        () => passengerCounts.reduce((sum, n) => sum + n, 0),
        [passengerCounts]
    );

    return (
        <Box
            sx={[
                {
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                },
                ...(sx ? (Array.isArray(sx) ? sx : [sx]) : []),
            ]}
        >
            <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 2, pb: 1 }}>
                <Box sx={{ position: 'relative', py: 0.5 }}>
                    {stops.map((stop, index) => {
                        const isSelected = stop.code === selectedStopID;
                        const isFirst = index === 0;
                        const isLast = index === stops.length - 1;
                        const passengerCount = passengerCounts[index];
                        const showLine = !isLast;

                        return (
                            <Box
                                key={stop.code}
                                onClick={() => onStopSelect(stop.code)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    py: 1.25,
                                    px: 1,
                                    borderRadius: 2,
                                    cursor: 'pointer',
                                    position: 'relative',
                                    bgcolor: isSelected
                                        ? (isDark ? 'rgba(25, 118, 210, 0.22)' : 'rgba(25, 118, 210, 0.1)')
                                        : 'transparent',
                                    transition: 'background-color 0.15s',
                                    '&:hover': {
                                        bgcolor: isDark
                                            ? 'rgba(255, 255, 255, 0.04)'
                                            : 'rgba(0, 0, 0, 0.03)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 28,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        position: 'relative',
                                        alignSelf: 'stretch',
                                        minHeight: 48,
                                    }}
                                >
                                    {showLine && (
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                left: '50%',
                                                top: 22,
                                                bottom: -24,
                                                width: 3,
                                                transform: 'translateX(-50%)',
                                                bgcolor: 'primary.main',
                                                opacity: isDark ? 0.85 : 0.55,
                                                borderRadius: 1,
                                            }}
                                        />
                                    )}
                                    <Box sx={{ mt: 0.5 }}>
                                        <TimelineMarker
                                            index={index}
                                            total={stops.length}
                                            isSelected={isSelected}
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography
                                        variant="body1"
                                        sx={{
                                            fontWeight: isSelected || isFirst ? 700 : 500,
                                            color: isSelected ? 'primary.main' : 'text.primary',
                                            lineHeight: 1.2,
                                        }}
                                    >
                                        {stop.name}
                                        {stop.is_main && (
                                            <Typography
                                                component="span"
                                                sx={{ ml: 0.75, color: 'warning.main', fontSize: '0.85rem' }}
                                            >
                                                ★
                                            </Typography>
                                        )}
                                    </Typography>
                                    {isSelected && (
                                        <Typography variant="caption" color="text.secondary">
                                            Código {stop.code}
                                        </Typography>
                                    )}
                                </Box>

                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        px: 1.25,
                                        py: 0.75,
                                        borderRadius: 2,
                                        bgcolor: isLast || isSelected
                                            ? (isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.12)')
                                            : (isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)'),
                                        border: '1px solid',
                                        borderColor: isLast || isSelected
                                            ? 'success.main'
                                            : 'divider',
                                        flexShrink: 0,
                                    }}
                                >
                                    <People
                                        sx={{
                                            fontSize: 18,
                                            color: isLast || isSelected ? 'success.main' : 'action.active',
                                        }}
                                    />
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            fontWeight: 700,
                                            minWidth: 20,
                                            textAlign: 'center',
                                            color: isLast || isSelected ? 'success.main' : 'text.primary',
                                        }}
                                    >
                                        {passengerCount}
                                    </Typography>
                                </Box>
                            </Box>
                        );
                    })}
                </Box>
            </Box>

            <Box
                sx={{
                    flexShrink: 0,
                    px: 2,
                    pb: 2,
                    pt: 1,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.03)',
                        border: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <People sx={{ color: 'primary.main' }} />
                    <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                            Pasajeros a bordo
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
                            {totalPassengers}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
