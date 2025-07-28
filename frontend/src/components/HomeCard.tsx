import React from "react";
import {Box, Button, Card, CardContent, CardMedia, FormControl, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import homecard from "../assets/images/homecard.jpg";
import {
    AirlineSeatLegroomNormal,
    ArrowDropDown,
    ArrowDropUp,
    DepartureBoard,
    Elderly,
    People,
    Add,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import {useTheme} from "../themes/ThemeProvider";
import {useTicketState} from "../states/TicketState";
import {models} from "../../wailsjs/go/models";

// IMAGES
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

    // State for dynamic time updates
    const [remainingTimeText, setRemainingTimeText] = React.useState<string>('');

    // Update remaining time every minute
    React.useEffect(() => {
        const updateRemainingTime = () => {
            if (selectedTime) {
                setRemainingTimeText(calculateRemainingTime(selectedTime));
            }
        };

        // Update immediately
        updateRemainingTime();

        // Update every minute
        const interval = setInterval(updateRemainingTime, 60000);

        return () => clearInterval(interval);
    }, [selectedTime]);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const timeString = event.target.value as string;
        
        // Find the corresponding Time object from the timetable
        const timetable = report?.timetable === 'regular'
            ? selectedRoute?.timetable
            : selectedRoute?.holiday_timetable;
            
        const selectedTimeObj = timetable?.find((time: models.Time) => 
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

        console.log("INCREASING")
        if (!times || times.length === 0) {
            console.error("Times not found or empty");
            return;
        }

        const currentIndex = times.findIndex((time: models.Time) => {
            return  time.hour === selectedTime.hour && time.minute === selectedTime.minute;
        });

        if (currentIndex === -1) {
            console.warn("Current time not found");
            return;
        }
    
        if (currentIndex < times.length - 1) {
            setSelectedTime(times[currentIndex + 1]);
            getAllCounts();
        } else {
            console.warn("Cannot increment: already at the last time");
        }
    };

    const handleDecrement = () => {
        const times = report?.timetable === "regular"
            ? selectedRoute.timetable
            : selectedRoute.holiday_timetable;

        if (!times || times.length === 0) {
            console.error("Times not found or empty");
            return;
        }
    
        const currentIndex = times.findIndex((time: models.Time) => {
            return time.hour === selectedTime.hour && time.minute === selectedTime.minute;
        });
    
        if (currentIndex === -1) {
            console.warn("Current time not found");
            return;
        }
    
        if (currentIndex > 0) {
            setSelectedTime(times[currentIndex - 1]);
            getAllCounts();
        } else {
            console.warn("Cannot decremment: already at the first time");
        }
    };

    const handleGoldTicket = () => {
        if (onShowDialog) {
            onShowDialog('gold');
        }
    }

    const handleRegularTicket = () => {
        if (onShowDialog) {
            onShowDialog('regular');
        } 
    }

    return (
        <Card sx={{ borderRadius: 0, width: '100%', backgroundColor: theme === "light" ? '#FAFAFA' : 'default' }}>
            <CardMedia
                component="img"
                image={homecard}
                title="bus"
                sx={{ margin: 'auto', objectFit: 'contain', width: '95%', pt: 2 }}
            />
            <CardContent>
                {/* Enhanced Schedule Section */}
                <Box sx={{ 
                    backgroundColor: theme === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)', 
                    borderRadius: 2, 
                    p: 2, 
                    mt: 1
                }}>
                    {/* Schedule Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ 
                                backgroundColor: 'action.hover', 
                                px: 1.5, 
                                py: 0.5, 
                                borderRadius: 1,
                                fontSize: '0.75rem'
                            }}>
                            {report?.timetable === 'regular' ? 'HORARIO REGULAR' : 'HORARIO FERIADO'}
                        </Typography>
                        <Box>
                            <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                                🕐 {remainingTimeText || 'Calculando...'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Time Selector */}
                    <Box sx={{ display: 'flex', alignItems:"center"  }}>
                        <FormControl
                            variant="standard"
                            sx={{
                                flexGrow: 1,
                                borderRadius: 1,
                                padding: "8px 12px",
                                "&:hover": {
                                    borderColor: "primary.main",
                                    cursor: "pointer",
                                },
                                "& .MuiSelect-select": {
                                    display: "flex",
                                    alignItems: "center",
                                },
                            }}
                        >
                            <Select
                                value={to24HourFormat(selectedTime)}
                                key={to24HourFormat(selectedTime)}
                                onChange={handleChange}
                                displayEmpty
                                renderValue={(timeString: string) => {
                                    return (
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DepartureBoard fontSize="large" sx={{ mr: 1, color: "text.secondary", pb: 0.5 }} />
                                            <Box sx={{ fontWeight: '500', fontSize: '2rem', color: "text.primary" }}>
                                                {timeString ? to12HourFormat(selectedTime) : ""}
                                            </Box>
                                        </Box>
                                    );
                                }}
                                sx={{
                                    fontSize: '1.8rem',
                                    '& .MuiSelect-icon': { display: 'none' }, // Hide default dropdown icon
                                }}
                            >
                               {(() => {
                                    const timetable =
                                        report?.timetable === 'regular'
                                            ? selectedRoute.timetable
                                            : selectedRoute.holiday_timetable;

                                    if (timetable?.length) {
                                        return timetable.map((time: models.Time) => {
                                            return (
                                                <MenuItem key={to24HourFormat(time)} value={to24HourFormat(time)}>
                                                    {to12HourFormat(time)}
                                                </MenuItem>
                                            );
                                        });
                                    } else {
                                        return <MenuItem disabled>No times available</MenuItem>;
                                    }
                                })()}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', alignItems:"center", flexDirection:"column", ml:1 }}   >
                            <IconButton onClick={handleDecrement} size="medium" sx={{ padding: "2px", marginBottom: "-8px" }}>
                                <ArrowDropUp fontSize="large" />
                            </IconButton>
                            <IconButton onClick={handleIncrement} size="medium" sx={{ padding: "2px", marginTop: "-8px" }}>
                                <ArrowDropDown fontSize="large" />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </CardContent>

            {/* Enhanced Passenger Count Section */}
            <Box
                sx={{
                    backgroundColor: theme === "light" ? 'rgba(255, 152, 0, 0.08)' : 'rgba(255, 183, 77, 0.08)',
                    borderTop: '1px solid',
                    borderBottom: '1px solid',
                    borderColor: theme === "light" ? 'rgba(255, 152, 0, 0.2)' : 'rgba(255, 183, 77, 0.2)',
                    py: 2,
                    px: 2,
                }}
            >
                {/* Count Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <People color="warning" fontSize="small" />
                        <Typography variant="body2" color="warning.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                            CONTEO ACTUAL
                        </Typography>
                    </Box>
                    
                    <Typography variant="h6" color="text.primary" sx={{ 
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <People fontSize="small" />
                        {currentCount + currentGoldCount} Total
                    </Typography>
                </Box>

                {/* Count Details */}
                <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: 2,
                    alignItems: 'center'
                }}>
                    {/* Gold/Elderly Count */}
                    <Box sx={{ 
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        borderRadius: 1.5,
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Elderly sx={{ color: "#FFC107" }} fontSize="medium" />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                Adulto Mayor
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: "#FFC107" }}>
                            {currentGoldCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            ₡{selectedStop.gold_fare} c/u
                        </Typography>
                    </Box>

                    {/* Normal Count */}
                    <Box sx={{ 
                        backgroundColor: 'rgba(156, 39, 176, 0.1)',
                        borderRadius: 1.5,
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AirlineSeatLegroomNormal color="secondary" fontSize="medium" />
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, fontSize: '0.8rem' }}>
                                Regular
                            </Typography>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main' }}>
                            {currentCount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            ₡{selectedStop.fare} c/u
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Enhanced Fare Buttons Section */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 0,
                    width: '100%'
                }}
            >
                {/* Gold Ticket Button */}
                <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    sx={{ 
                        fontSize: 18, 
                        py: 2.5, 
                        borderRadius: 0,
                        backgroundColor: "#FBC02D",
                        color: '#000',
                        fontWeight: 700,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        '&:hover': {
                            backgroundColor: "#F9A825",
                        }
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

                {/* Normal Ticket Button */}
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
    )
}

export default HomeCard;