import React from "react";
import {Box, Button, Card, CardContent, CardMedia, Chip, FormControl, MenuItem, Paper, Select, SelectChangeEvent, Typography} from "@mui/material";
import homecard from "../assets/images/homecard.jpg";
import {
    AirlineSeatLegroomNormal,
    AccessTime,
    DepartureBoard,
    Elderly,
    People,
    Add,
    ChevronLeft,
    ChevronRight,
} from "@mui/icons-material";
import {useTheme} from "../themes/ThemeProvider";
import {useTicketState} from "../states/TicketState";
import {models} from "../../wailsjs/go/models";

import { to12HourFormat, to24HourFormat, calculateRemainingTime } from "../util/Helpers";
import { useReportState } from "../states/ReportState";

interface HomeCardProps {
    onShowDialog?: (ticketType: 'regular' | 'gold') => void;
}

const HomeCard: React.FC<HomeCardProps> = ({ onShowDialog }) => {
    const {theme} = useTheme();
    const {
        selectedTime, setSelectedTime,
        selectedRoute,
        selectedStop,
        currentCount,
        currentGoldCount,
        getAllCounts,
    } = useTicketState();

    const { report } = useReportState();

    const [remainingTimeText, setRemainingTimeText] = React.useState<string>('');

    React.useEffect(() => {
        const updateRemainingTime = () => {
            if (selectedTime) {
                setRemainingTimeText(calculateRemainingTime(selectedTime));
            }
        };
        updateRemainingTime();
        const interval = setInterval(updateRemainingTime, 60000);
        return () => clearInterval(interval);
    }, [selectedTime]);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const timeString = event.target.value as string;
        const timetable = report?.timetable === 'regular'
            ? selectedRoute?.timetable
            : selectedRoute?.holiday_timetable;
        const selectedTimeObj = timetable.find((time: models.Time) =>
            to24HourFormat(time) === timeString
        );
        if (selectedTimeObj) {
            setSelectedTime(selectedTimeObj);
            getAllCounts();
        }
    };

    const handleIncrement = () => {
        const times = report?.timetable === "regular"
            ? selectedRoute.timetable
            : selectedRoute.holiday_timetable;
        if (!times || times.length === 0) return;
        const currentIndex = times.findIndex((time: models.Time) =>
            time.hour === selectedTime.hour && time.minute === selectedTime.minute
        );
        if (currentIndex === -1) return;
        if (currentIndex < times.length - 1) {
            setSelectedTime(times[currentIndex + 1]);
            getAllCounts();
        }
    };

    const handleDecrement = () => {
        const times = report?.timetable === "regular"
            ? selectedRoute.timetable
            : selectedRoute.holiday_timetable;
        if (!times || times.length === 0) return;
        const currentIndex = times.findIndex((time: models.Time) =>
            time.hour === selectedTime.hour && time.minute === selectedTime.minute
        );
        if (currentIndex === -1) return;
        if (currentIndex > 0) {
            setSelectedTime(times[currentIndex - 1]);
            getAllCounts();
        }
    };

    const handleGoldTicket = () => { if (onShowDialog) onShowDialog('gold'); };
    const handleRegularTicket = () => { if (onShowDialog) onShowDialog('regular'); };

    return (
        <Card sx={{ borderRadius: 0, width: '100%', backgroundColor: theme === "light" ? '#FAFAFA' : 'default' }}>
            <CardMedia
                component="img"
                image={homecard}
                title="bus"
                sx={{ margin: 'auto', objectFit: 'contain', width: '95%', pt: 2 }}
            />
            <CardContent>
                {/* Schedule Section */}
                <Box sx={{
                    backgroundColor: theme === "light" ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 2,
                    p: 2,
                    mt: 1,
                    border: '1px solid',
                    borderColor: theme === "light" ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.08)',
                }}>
                    {/* Schedule Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Chip
                            label={report?.timetable === 'regular' ? 'Regular' : 'Feriado'}
                            size="small"
                            variant="outlined"
                            color={report?.timetable === 'regular' ? 'primary' : 'success'}
                            sx={{ fontSize: '0.7rem', height: 22 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTime sx={{ fontSize: 14, color: 'primary.main' }} />
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                                {remainingTimeText || 'Calculando...'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Time Selector: [<] [Select] [>] */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleDecrement}
                            sx={{ minWidth: 36, px: 0, py: 1 }}
                        >
                            <ChevronLeft />
                        </Button>

                        <FormControl variant="standard" sx={{ flexGrow: 1 }}>
                            <Select
                                value={to24HourFormat(selectedTime)}
                                key={to24HourFormat(selectedTime)}
                                onChange={handleChange}
                                displayEmpty
                                renderValue={(timeString: string) => (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <DepartureBoard fontSize="medium" sx={{ mr: 1, color: "text.secondary" }} />
                                        <Box sx={{ fontWeight: 700, fontSize: '2rem', color: "text.primary" }}>
                                            {timeString ? to12HourFormat(selectedTime) : ""}
                                        </Box>
                                    </Box>
                                )}
                                sx={{
                                    fontSize: '1.8rem',
                                    textAlign: 'center',
                                    '& .MuiSelect-icon': { display: 'none' },
                                }}
                            >
                                {(() => {
                                    const timetable = report?.timetable === 'regular'
                                        ? selectedRoute.timetable
                                        : selectedRoute.holiday_timetable;
                                    if (timetable.length > 0) {
                                        return timetable.map((time: models.Time) => (
                                            <MenuItem key={to24HourFormat(time)} value={to24HourFormat(time)}>
                                                {to12HourFormat(time)}
                                            </MenuItem>
                                        ));
                                    }
                                    return <MenuItem disabled>No hay horarios</MenuItem>;
                                })()}
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            size="small"
                            onClick={handleIncrement}
                            sx={{ minWidth: 36, px: 0, py: 1 }}
                        >
                            <ChevronRight />
                        </Button>
                    </Box>
                </Box>
            </CardContent>

            {/* Passenger Count Section */}
            <Box sx={{ py: 2, px: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, fontSize: '0.65rem', lineHeight: 1 }}>
                            Venta
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    {/* Gold/Elderly Count */}
                    <Paper variant="outlined" sx={{
                        p: 1.5,
                        borderLeft: '4px solid',
                        borderLeftColor: 'warning.main',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Elderly sx={{ color: 'warning.main', fontSize: 18 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Adulto Mayor
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'warning.main', lineHeight: 1 }}>
                            {currentGoldCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ₡{selectedStop.gold_fare} c/u
                        </Typography>
                    </Paper>

                    {/* Regular Count */}
                    <Paper variant="outlined" sx={{
                        p: 1.5,
                        borderLeft: '4px solid',
                        borderLeftColor: 'secondary.main',
                        borderRadius: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.25,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AirlineSeatLegroomNormal color="secondary" sx={{ fontSize: 18 }} />
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Regular
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', lineHeight: 1 }}>
                            {currentCount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            ₡{selectedStop.fare} c/u
                        </Typography>
                    </Paper>
                </Box>
            </Box>

            {/* Fare Buttons */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, width: '100%' }}>
                <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="warning"
                    sx={{
                        fontSize: 18,
                        py: 2.5,
                        borderRadius: 0,
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                    }}
                    onClick={handleGoldTicket}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Add fontSize="small" />
                        <Elderly fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'inherit' }}>
                        ₡{selectedStop.gold_fare}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.8, color: 'inherit' }}>
                        Adulto Mayor
                    </Typography>
                </Button>

                <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    color="secondary"
                    sx={{
                        fontSize: 18,
                        py: 2.5,
                        borderRadius: 0,
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                    }}
                    onClick={handleRegularTicket}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Add fontSize="small" />
                        <AirlineSeatLegroomNormal fontSize="small" />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: 'inherit' }}>
                        ₡{selectedStop.fare}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: '0.75rem', opacity: 0.8, color: 'inherit' }}>
                        Tarifa Regular
                    </Typography>
                </Button>
            </Box>
        </Card>
    );
};

export default HomeCard;
