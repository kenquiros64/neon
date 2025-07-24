import React, { useEffect, useState } from 'react';
// import { useReportState } from '../states/ReportState';
import { useRoutesState } from '../states/RoutesState';
import {useAuthState} from "../states/AuthState";
import NoReport from "../components/NoReport";
import {useTicketState} from "../states/TicketState";
import {toast} from "react-toastify";
import {Avatar, Badge, Box, Grid, ListItemAvatar, TextField, Typography} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import {People, QuestionMarkOutlined} from "@mui/icons-material";
import HomeCard from "../components/HomeCard";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import routeList from "../assets/images/route_list.png";
import stopList from "../assets/images/stop_list.png";
import ListItemText from "@mui/material/ListItemText";

const Ticket: React.FC = () => {
    // const { report, checkReportStatus } = useReportState();
    const [showDialog, setShowDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const {code, setCode} = useTicketState();
    const { user } = useAuthState();

    const {routes, loading, fetchRoutes, resetRoutesState} = useRoutesState();
    const {
        selectedRoute, setSelectedRoute,
        setSelectedStop,
        setSelectedTimetable,
        setSelectedTime,
        resetTicketState,
        getCount,
        getAllCounts,
        getStopCounts
    } = useTicketState();
    const { logout } = useAuthState();
    const [selectedRouteId, setSelectedRouteId] = useState<String | null>(null);
    const [selectedStopId, setSelectedStopId] = useState<String | null>(null);

    // const handleKeyDown = (event: { key: string; }) => {
    //     if (event.key === 'Enter') {
    //         console.log("Enter")
    //     }
    //     if (event.key === 'o') {
    //         console.log("O")
    //     }
    // };

    const handleSelect = (id: String) => {
        setSelectedRouteId(id);
        let r = routes.find((route) => {
            const routeKey = `${route.departure.toLowerCase()}-${route.destination.toLowerCase()}`;
            return routeKey === id;
        });
        if (!r) {
            return;
        }

        setSelectedRoute(r);

        const mainStop = r.stops?.find((stop) => stop.is_main);
        if (!mainStop) {
            return;
        }

        setSelectedStop(mainStop);
        setSelectedStopId(mainStop.code);
        // setSelectedTime(r.nextDeparture("normal"));
        getAllCounts();
        getStopCounts();
    };

    const handleSelectStop = (id: String) => {
        setSelectedStopId(id);

        const mainStop = selectedRoute?.stops.find((stop) => stop.code === id);
        if (!mainStop) {
            return;
        }

        setSelectedStop(mainStop);
        getStopCounts();
    };

    const handleInputCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        let code = e.target.value;
        if (/^\d*$/.test(code)) {
            // Update state only if the value is numeric (allows empty string for clearing)
            setCode(code);
        }

        let route = routes.find((route) => {
            return route.stops.find((stop) => stop.code === code);
        });
        if (!route) {
            return;
        }

        let stop = route.stops.find((stop) => stop.code === code);
        if (!stop) {
            return;
        }

        setSelectedRoute(route);
        setSelectedRouteId(`${route.departure.toLowerCase()}-${route.destination.toLowerCase()}`);
        setSelectedStop(stop);
        setSelectedStopId(stop.code);
        getAllCounts();
        getStopCounts();
    }

    useEffect(() => {
        if (routes.length > 0) {
            let stopIndex = routes[0].stops.findIndex((stop) => stop.is_main);

            setSelectedRoute(routes[0]);
            setSelectedRouteId(`${routes[0].departure.toLowerCase()}-${routes[0].destination.toLowerCase()}`);
            setSelectedTimetable("normal");
            setSelectedStop(routes[0].stops[stopIndex]);
            setSelectedStopId(routes[0].stops[stopIndex].code);

            // setSelectedTime(routes[0].nextDeparture("normal"));
            return;
        }
        if (!loading) {
            toast.info("No hay rutas disponibles");
            resetRoutesState();
            resetTicketState();
            logout();
        }
    }, [routes, setSelectedRoute, setSelectedTimetable, setSelectedStop]);


    // useEffect(() => {
    //     checkReportStatus(user?.username).then().catch((error) => {
    //         console.error("CHECK REPORT STATUS ERROR", error);
    //     });
    // }, [checkReportStatus]);


    // useEffect(() => {
    //     setIsLoading(false);
    //     if (!report) {
    //         setShowDialog(true);
    //         return;
    //     }
    //     fetchRoutes();
    //     setShowDialog(false);
    // }, [report]);

    return isLoading
        ? null
        : showDialog ?
        <NoReport /> :
        <Grid container sx={{height: "100%", margin: 0}}>
            <Grid
                size={{ lg: 5 }}
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    padding: 2,
                    gap: 2,
                }}
            >
                <Box sx={{display: "flex", alignItems: "center"}}>
                    <TextField
                        fullWidth
                        placeholder={"Código"}
                        value={code}
                        onChange={handleInputCode}
                        sx={{ pattern: "[0-9]*", inputMode: "numeric" }}
                    />
                    <IconButton aria-label="faq-code" color="primary">
                        <QuestionMarkOutlined/>
                    </IconButton>
                </Box>
                <Box sx={{alignItems: "center", display: "flex", height: "100%"}}>
                    <HomeCard/>
                </Box>
            </Grid>
            <Divider sx={{height: "100%"}} orientation={"vertical"} flexItem/>
            <Grid
                size="grow"
                sx={{
                    height: "100%",
                    maxHeight: "500px",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                <List>
                    {routes.map((route) => {
                        const routeKey = `${route.departure.toLowerCase()}-${route.destination.toLowerCase()}`;
                        return (
                            <ListItem key={routeKey} disablePadding>
                                <ListItemButton
                                    key={routeKey}
                                    selected={routeKey === selectedRouteId}
                                    onClick={() => handleSelect(routeKey)}
                                    sx={{
                                        cursor: "pointer",
                                        padding: "16px", // Add spacing for a larger clickable area
                                        display: "flex", // Ensure proper alignment
                                        alignItems: "center",
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            src={routeList}
                                            sx={{
                                                width: 56, // Larger width
                                                height: 56, // Larger height
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={

                                            <Typography
                                                variant="subtitle1" component={"span"}  sx={{ fontWeight:"600" }}
                                            >
                                                {`${route.departure}-${route.destination}`}
                                            </Typography>
                                        }
                                        secondary={`Siguiente: ...`}
                                        // secondary={`Siguiente: ${route.nextDeparture("normal").to12HourString()}`}
                                        sx={{
                                            "& .MuiTypography-root": {
                                                fontSize: "1.1rem", // Larger font size for both primary and secondary text
                                            },
                                            "& .MuiTypography-body2": {
                                                fontSize: "1rem", // Customize secondary text size
                                            },
                                            marginLeft: 2, // Add spacing between text and avatar
                                        }}
                                    />
                                </ListItemButton>
                            </ListItem>

                        );
                    })}
                </List>
            </Grid>
            <Divider sx={{height: "100%"}} orientation={"vertical"} flexItem/>
            <Grid
                size="grow"
                sx={{
                    height: "100%",
                    maxHeight: "500px",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                <List>
                    {selectedRoute?.stops.map((stop) => {
                        return (
                            <ListItem key={stop.code} disablePadding>
                                <ListItemButton
                                    key={stop.code}
                                    selected={stop.code === selectedStopId}
                                    onClick={() => handleSelectStop(stop.code)}
                                    sx={{
                                        cursor: "pointer",
                                        display: "flex",
                                        justifyContent: "space-between", // Space out content
                                        alignItems: "center", // Center vertically
                                        padding: "16px", // Increase padding for more space
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center" }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                src={stopList}
                                                sx={{
                                                    width: 56, // Larger width
                                                    height: 56, // Larger height
                                                }}
                                            />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    variant="subtitle1" component={"span"}  sx={{ fontWeight:"600" }}
                                                >
                                                    {stop.name}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    Código: <Typography variant="body2" component={"span"} sx={{ fontWeight:"600" }}>
                                                    {stop.code}
                                                </Typography>
                                                </>
                                            }
                                            sx={{
                                                "& .MuiTypography-root": {
                                                    fontSize: "1.1rem", // Larger font size for both primary and secondary text
                                                },
                                                "& .MuiTypography-body2": {
                                                    fontSize: "1rem", // Customize secondary text size
                                                },
                                                marginLeft: 2, // Add spacing between text and avatar
                                            }}
                                        />
                                    </Box>
                                    <Badge
                                        showZero
                                        color="secondary"
                                        badgeContent={getCount(stop.name)}
                                        anchorOrigin={{
                                            vertical: 'top',
                                            horizontal: 'right',
                                        }}
                                        max={99}
                                        sx={{
                                            "& .MuiBadge-badge": {
                                                color: "#292929",
                                                minWidth: "25px",
                                                height: "25px",
                                                fontSize: "14px",
                                                borderRadius: "50%",
                                                lineHeight: "20px",
                                                padding: "0",
                                            },
                                            mr: 2,
                                        }}
                                    >
                                        <People fontSize={"large"} color="action"/>
                                    </Badge>
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Grid>
        </Grid>;
};

export default Ticket;