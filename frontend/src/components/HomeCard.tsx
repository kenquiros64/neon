import React from "react";
import {Box, Button, Card, CardContent, CardMedia, FormControl, MenuItem, Select, SelectChangeEvent, Typography} from "@mui/material";
import bus1Icon from "../assets/images/bus1.png";
import Divider from "@mui/material/Divider";
import {
    AirlineSeatLegroomNormal,
    ArrowDropDown,
    ArrowDropUp,
    DepartureBoard,
    Elderly,
} from "@mui/icons-material";
import IconButton from "@mui/material/IconButton";
import {useTheme} from "../themes/ThemeProvider";
import {useTicketState} from "../states/TicketState";
import {models} from "../../wailsjs/go/models";

// IMAGES
import routeLight from "../assets/images/route_light.png";
import routeDark from "../assets/images/route_dark.png";

const HomeCard: React.FC = () => {
    const {theme} = useTheme();
    const {
        selectedTime, setSelectedTime,
        selectedRoute,
        selectedStop,
        selectedTimetable,
        currentCount,
        currentGoldCount,
        incrementCount,
        getStopCounts,
        getAllCounts,
    } = useTicketState();

    const handleChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value as string;
        // const time = models.Time.from12HourString(value)

        // setSelectedTime(time);
        getAllCounts();
        getStopCounts();
    };

    const handleIncrement = () => {
        const times = selectedTimetable === "normal"
            ? selectedRoute?.timetable
            : selectedRoute?.holiday_timetable;

        console.log("INCREASING")
        if (!times || times.length === 0) {
            console.error("Times not found or empty");
            return;
        }

        const currentIndex = times.findIndex((time: models.Time) => {
            return  time.hour === selectedTime?.hour && time.minute === selectedTime?.minute;
        });

        if (currentIndex === -1) {
            console.warn("Current time not found");
            return;
        }
    
        if (currentIndex < times.length - 1) {
            setSelectedTime(times[currentIndex + 1]);
            getAllCounts();
            getStopCounts();
        } else {
            console.warn("Cannot increment: already at the last time");
        }
    };

    const handleDecrement = () => {
        const times = selectedTimetable === "normal"
            ? selectedRoute?.timetable
            : selectedRoute?.holiday_timetable;

        if (!times || times.length === 0) {
            console.error("Times not found or empty");
            return;
        }
    
        const currentIndex = times.findIndex((time: models.Time) => {
            return time.hour === selectedTime?.hour && time.minute === selectedTime?.minute;
        });
    
        if (currentIndex === -1) {
            console.warn("Current time not found");
            return;
        }
    
        if (currentIndex > 0) {
            setSelectedTime(times[currentIndex - 1]);
            getAllCounts();
            getStopCounts();
        } else {
            console.warn("Cannot decremment: already at the first time");
        }
    };

    const handleGoldTicket = () => {
        incrementCount(1, "gold");
    }

    const  handleNormalTicket = () => {
        incrementCount(1, "normal");
    }

    return (
        <Card sx={{ borderRadius: 0, width: '100%', backgroundColor: theme === "light" ? '#FAFAFA' : 'default' }}>
            <CardMedia
                component="img"
                image={bus1Icon}
                title="bus"
                sx={{ width: '50%', margin: 'auto', pt: 2 }}
            />
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    {/* Left Side - Image */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'left',
                            alignItems: 'center',
                            height: '100%', // Let the parent container grow dynamically
                        }}
                    >
                        <CardMedia
                            component="img"
                            image={theme === "light" ? routeLight : routeDark}
                            title="bus"
                            sx={{
                                height: 'auto', // Dynamically adjusts height
                                width: '75%',   // Adjusts width based on parent size
                                maxWidth: '200px', // Prevents it from growing too large
                                minWidth: '50px',  // Prevents it from shrinking too small
                                objectFit: 'contain', // Keeps image aspect ratio
                                mt: 1,
                                ml: 2,
                            }}
                        />
                    </Box>

                    {/* Right Side - Text */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'left', width: '65%' }}>
                        <Typography variant="h5" sx={{ mb:2, pb:3 , color: "text.secondary", fontWeight: "800" }}>
                            {selectedRoute?.departure}
                        </Typography>
                        <Typography variant="h5" sx={{ color: "text.secondary", fontWeight: "800" }} >
                            {selectedRoute?.destination}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: "center" }}>
                    <Typography variant="h3" color="primary" sx={{ textAlign:"center" }}>
                        {selectedStop?.name}
                    </Typography>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: "center" }}>
                    <Typography variant="h5" color="text.secondary" sx={{ textAlign:"center" }}>
                        Horario Normal
                    </Typography>
                </Box>
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
                            // value={
                            //     selectedTime?.to12HourString()
                            // }
                            // key={selectedTime?.toShortString()}
                            onChange={handleChange}
                            displayEmpty
                            renderValue={(time) => {
                                return (
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <DepartureBoard fontSize="large" sx={{ mr: 1, color: 'gray', pb: 0.5 }} />
                                        <Box sx={{ fontWeight: 'bold', fontSize: '2.3rem' }}>
                                            {time}
                                        </Box>
                                    </Box>
                                );
                            }}
                            sx={{
                                fontSize: '2.3rem',
                                fontWeight: 'bold',
                                '& .MuiSelect-icon': { display: 'none' }, // Hide default dropdown icon
                            }}
                        >
                           {/* {(() => {
                                const timetable =
                                    selectedTimetable === 'normal'
                                        ? selectedRoute?.timetable
                                        : selectedRoute?.holiday_timetable;

                                if (timetable?.length) {
                                    return timetable.map((time: models.Time) => {
                                        // const timeString = time.to12HourString();
                                        // return (
                                        //     <MenuItem key={time.toShortString()} value={timeString}>
                                        //         {timeString}
                                        //     </MenuItem>
                                        // );
                                    });
                                } else {
                                    return <MenuItem disabled>No times available</MenuItem>;
                                }
                            })()} */}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', alignItems:"center", flexDirection:"column", ml:1 }}   >
                        <IconButton onClick={handleDecrement} size="small" sx={{ paddingTop: "2px" }}>
                            <ArrowDropUp fontSize="large" />
                        </IconButton>
                        <IconButton onClick={handleIncrement} size="small" sx={{ paddingBottom: "2px" }}>
                            <ArrowDropDown fontSize="large" />
                        </IconButton>
                    </Box>
                </Box>
            </CardContent>

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    py: 2,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: theme === "light" ? '#EEEEEE' : 'default'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Elderly sx={{ color: "#FFC107" }} fontSize={"large"} />
                    <Typography variant="h5" sx={{ fontWeight: '200' }}>{currentGoldCount}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AirlineSeatLegroomNormal color="secondary" fontSize={"large"} />
                    <Typography variant="h5" sx={{ fontWeight: '200' }}>{currentCount}</Typography>
                </Box>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: '200' }}>Total:</Typography>
                    <Typography variant="h5" sx={{ fontWeight:"bold" }}>{currentCount+currentGoldCount}</Typography>
                </Box>
            </Box>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    width: '100%'
                }}
            >
                <Button
                    fullWidth
                    size={"large"}
                    variant="contained"
                    sx={{ fontSize: 20, py: 2, borderRadius: 0, backgroundColor: "#FBC02D" }}
                    onClick={handleGoldTicket}
                >
                    {/* ₡{selectedStop?.goldFare} */}
                </Button>
                <Button
                    fullWidth
                    size={"large"}
                    variant="contained"
                    color="secondary"
                    sx={{ fontSize: 20, py: 2, borderRadius: 0 }}
                    onClick={handleNormalTicket}
                >
                    ₡{selectedStop?.fare}
                </Button>
            </Box>
        </Card>
    )
}

export default HomeCard;