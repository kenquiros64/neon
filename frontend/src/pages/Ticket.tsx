import React, { useEffect, useState, useRef } from 'react';
import {useReportState} from '../states/ReportState';
import {useRoutesState} from '../states/RoutesState';
import {useTicketState} from "../states/TicketState";
import {useAuthState} from "../states/AuthState";
import StartReport from "../components/StartReport";
import {toast} from "react-toastify";
import {
    Avatar, 
    Badge, 
    Box, 
    Grid, 
    ListItemAvatar, 
    TextField, 
    Typography, 
    CardMedia, 
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    CircularProgress,
    Alert,
    AlertTitle
} from "@mui/material";
import {People, TripOrigin, LocationOn, Route as RouteIcon, DirectionsBus, Star, LocalAtm} from "@mui/icons-material";
import HomeCard from "../components/HomeCard";
import TicketPurchaseDialog from "../components/TicketPurchaseDialog";
import routeList from "../assets/images/map.png";
import stopList from "../assets/images/stop_list.svg";
import { to12HourFormat, nextDeparture, fullRouteName, to24HourFormat } from "../util/Helpers";
import {useTheme} from "../themes/ThemeProvider";
import { AddTicket } from "../../wailsjs/go/services/TicketService";
import { models } from "../../wailsjs/go/models";
import { useNavigate } from 'react-router-dom';

// IMAGES
import routeLight from "../assets/images/route_light.svg";
import routeDark from "../assets/images/route_dark.svg";


const Ticket: React.FC = () => {
    const { report, checkReportStatus, reportLoading, resetReportState } = useReportState();
    const [showDialog, setShowDialog] = useState(false);
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [purchaseTicketType, setPurchaseTicketType] = useState<'regular' | 'gold'>('regular');
    const { user } = useAuthState();
    const {theme} = useTheme();
    const navigate = useNavigate();
    
    // Add ref for input focus
    const inputRef = useRef<HTMLInputElement>(null);

    const {routes, routesLoading, fetchRoutes, resetRoutesState} = useRoutesState();
    const {
        selectedRoute, 
        setSelectedRoute,
        selectedTime,
        setSelectedStop,
        setSelectedTime,
        resetTicketState,
        getCount,
        getAllCounts,
        code, 
        setCode, 
        incrementCount
    } = useTicketState();
    const { logout } = useAuthState();
    const [selectedRouteID, setSelectedRouteID] = useState<String | null>(null);
    const [selectedStopID, setSelectedStopID] = useState<String | null>(null);
    const [reportStatusChecked, setReportStatusChecked] = useState(false);

    // Check if there's a pending report from another user
    const hasPendingReportFromOtherUser = report && report.username !== user.username;

    const handleSelect = (id: String) => {
        setSelectedRouteID(id);
        let route = routes.find((route) => {
            return fullRouteName(route) === id;
        });
        if (!route) {
            return;
        }

        setSelectedRoute(route);

        const mainStop = route.stops?.find((stop) => stop.is_main);
        if (!mainStop) {
            return;
        }

        setSelectedStop(mainStop);
        setSelectedStopID(mainStop.code);
        setSelectedTime(nextDeparture(route, (report?.timetable as 'regular' | 'holiday') || "regular"));
        getAllCounts();


        if (!hasPendingReportFromOtherUser) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    const handleSelectStop = (id: String) => {
        setSelectedStopID(id);

        const mainStop = selectedRoute.stops.find((stop) => stop.code === id);
        if (!mainStop) {
            return;
        }

        setSelectedStop(mainStop);
        getAllCounts();

        if (!hasPendingReportFromOtherUser) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
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
        setSelectedRouteID(fullRouteName(route));
        setSelectedStop(stop);
        setSelectedStopID(stop.code);
        getAllCounts();
        setSelectedTime(nextDeparture(route, (report?.timetable as 'regular' | 'holiday') || "regular"));
        
        // Clear the input and maintain focus
        setCode("");
        if (!hasPendingReportFromOtherUser) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }

    const handlePurchaseConfirm = async (quantity: number, idNumber?: string) => {
        try {
            // Create ticket objects based on quantity
            const ticketsToAdd: models.Ticket[] = [];
            const currentSelectedStop = selectedRoute.stops.find(stop => stop.code === selectedStopID);
            
            if (!currentSelectedStop || !selectedRoute || !selectedTime || !user) {
                toast.error("Faltan datos para crear el ticket");
                return;
            }

            for (let i = 0; i < quantity; i++) {
                const ticket = new models.Ticket({
                    id: 0, // Will be set by database
                    departure: selectedRoute.departure,
                    destination: selectedRoute.destination,
                    username: user.username,
                    stop: currentSelectedStop.name,
                    time: to24HourFormat(selectedTime),
                    fare: purchaseTicketType === 'gold' ? currentSelectedStop.gold_fare : currentSelectedStop.fare,
                    id_number: idNumber || "",
                    is_gold: purchaseTicketType === 'gold',
                    is_null: false,
                    report_id: report?.id || 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                ticketsToAdd.push(ticket);
            }

            // Save tickets to database
            const savedTickets = await AddTicket(ticketsToAdd);
            
            // Only increment counts if database save was successful
            incrementCount(quantity, purchaseTicketType);
            
            // Show success message
            toast.success(`${quantity} tiquete${quantity > 1 ? 's' : ''} guardado${quantity > 1 ? 's' : ''} exitosamente`);
            
            setShowPurchaseDialog(false);
            
            console.log("Tickets saved successfully:", savedTickets);
            
        } catch (error) {
            console.error("Error saving tickets:", error);
            toast.error("Error al guardar los tickets. No se modificaron los conteos.");
            // Don't close dialog or increment counts on error
        }
    };

    const handlePurchaseCancel = () => {
        setShowPurchaseDialog(false);
        // Refocus the input after dialog closes
        if (!hasPendingReportFromOtherUser) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    };

    const handleShowDialogFromHomeCard = (ticketType: 'regular' | 'gold') => {
        setPurchaseTicketType(ticketType);
        setShowPurchaseDialog(true);
    };

    useEffect(() => {
        if (routesLoading) {
            return;
        }

        if (routes.length === 0) {
            toast.info("No hay rutas disponibles");
            resetRoutesState();
            resetTicketState();
            logout();
            return;
        }

        let stopIndex = routes[0].stops.findIndex((stop) => stop.is_main);

        setSelectedRoute(routes[0]);
        setSelectedRouteID(fullRouteName(routes[0]));
        setSelectedStop(routes[0].stops[stopIndex]);
        setSelectedStopID(routes[0].stops[stopIndex].code);
        setSelectedTime(nextDeparture(routes[0], (report?.timetable as 'regular' | 'holiday') || "regular"));
        getAllCounts();
    }, [routes, routesLoading, report]);


    // Check report status when component mounts
    useEffect(() => {
        if (!report) {
            checkReportStatus().catch((error) => {
                if (error === "ROW_NOT_FOUND") {
                    console.log("No report found, checking status");
                    setReportStatusChecked(true);   
                    setShowDialog(true);
                    return;
                }
                console.error("Error checking report status", error);
                setReportStatusChecked(true);
                logout();
            });
            return;
        }
        fetchRoutes();
        setReportStatusChecked(true);
        setShowDialog(false);
    }, []);

    useEffect(() => {
        console.log("Report state changed in Ticket page:", report);
        if (report) {
            fetchRoutes();
            setReportStatusChecked(true);
            setShowDialog(false);
            return;
        }
        setShowDialog(true);

    }, [report, reportLoading]);

    // Focus input field when time changes
    useEffect(() => {
        if (selectedTime && !hasPendingReportFromOtherUser) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [selectedTime, hasPendingReportFromOtherUser]);

    // Focus input field when component mounts
    useEffect(() => {
        if (!hasPendingReportFromOtherUser) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [hasPendingReportFromOtherUser]);

    // Global keydown handler for Enter and Space
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if there's a pending report from another user
            if (hasPendingReportFromOtherUser) return;
            
            // Don't trigger if a dialog is open
            if (showPurchaseDialog) return;
            
            // Don't trigger if user is typing in an input field (except our code input)
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && target !== inputRef.current) return;
            if (target.tagName === 'TEXTAREA') return;
            
            if (e.key === ' ') {
                e.preventDefault(); // Prevent space from scrolling the page
                // Show dialog for regular ticket
                setPurchaseTicketType('regular');
                setShowPurchaseDialog(true);
            } else if (e.key === 'Enter') {
                e.preventDefault(); // Prevent any default behavior
                // Show dialog for gold ticket
                setPurchaseTicketType('gold');
                setShowPurchaseDialog(true);
            }
        };

        // Add event listener
        document.addEventListener('keydown', handleGlobalKeyDown);

        // Cleanup
        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [hasPendingReportFromOtherUser, showPurchaseDialog, inputRef]);

    if (!reportStatusChecked || reportLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Show StartReport dialog if needed
    if (showDialog) {
        return <StartReport />;
    }

    if (routesLoading) {
        return null;
    }

    return (
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
                {hasPendingReportFromOtherUser ? (
                    // Show alert when there's a pending report from another user
                    <Alert 
                        severity="warning" 
                        sx={{ 
                            height: "100%",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            textAlign: "center"
                        }}
                    >
                        <AlertTitle sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
                            Reporte Pendiente de Otro Usuario
                        </AlertTitle>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Hay un reporte pendiente abierto por <strong>{report?.username}</strong>.
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Para poder vender tiquetes, es necesario cerrar el reporte pendiente desde la sección de Reportes.
                        </Typography>
                    </Alert>
                ) : (
                    // Show normal selling UI when user can sell tickets
                    <>
                        <Box sx={{display: "flex", alignItems: "center"}}>
                            <TextField
                                fullWidth
                                placeholder={"Código"}
                                value={code}
                                onChange={handleInputCode}
                                inputRef={inputRef}
                                sx={{ pattern: "[0-9]*", inputMode: "numeric" }}
                            />
                        </Box>
                        <Box sx={{alignItems: "center", display: "flex", height: "100%"}}>
                            <HomeCard onShowDialog={handleShowDialogFromHomeCard}/>
                        </Box>
                    </>
                )}
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
                {/* Enhanced Route Information Box */}
                {selectedRoute && (
                    <Box
                        sx={{
                            backgroundColor: theme === "light" ? 'rgba(25, 118, 210, 0.08)' : 'rgba(144, 202, 249, 0.08)', 
                            borderRadius: 0, 
                            p: 2,
                            minHeight: '140px',
                            height: '140px',
                            border: theme === "light" ? '1px solid rgba(25, 118, 210, 0.2)' : '1px solid rgba(144, 202, 249, 0.2)',
                            borderLeft: 'none',
                            borderRight: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        {/* Route Header */}
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <RouteIcon color="primary" fontSize="small" />
                                <Typography variant="body2" color="primary" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                    RUTA ACTIVA
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ 
                                backgroundColor: 'action.hover', 
                                px: 1, 
                                py: 0.3,
                                borderRadius: 1,
                                fontSize: '0.7rem'
                            }}>
                                {selectedRoute.stops.length || 0} PARADAS
                            </Typography>
                        </Box>

                        {/* Route Content */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            {/* Left Side - Route Image */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    minWidth: '80px',
                                    height: '80px',
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    image={theme === "light" ? routeLight : routeDark}
                                    title="route"
                                    sx={{
                                        height: 'auto',   
                                        maxWidth: '70px',
                                        objectFit: 'contain',
                                    }}
                                />
                            </Box>

                            {/* Right Side - Route Details */}
                            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                {/* Departure */}
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                    <TripOrigin sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: "400", fontSize: '0.75rem', lineHeight: 1 }}>
                                            Salida
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "700", lineHeight: 1 }}>
                                            {selectedRoute.departure}
                                        </Typography>
                                    </Box>
                                </Box>

                                {/* Destination */}
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <LocationOn sx={{ fontSize: 16, color: 'primary.main', mr: 1 }} />
                                    <Box>
                                        <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: "400", fontSize: '0.75rem', lineHeight: 1 }}>
                                            Destino
                                        </Typography>
                                        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: "700", lineHeight: 1 }}>
                                            {selectedRoute.destination}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

                <List sx={{ p: 0, mt: 1 }}>
                    {routes.map((route) => {
                        const routeKey = fullRouteName(route);
                        return (
                            <ListItem key={routeKey} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    key={routeKey}
                                    selected={routeKey === selectedRouteID}
                                    onClick={() => handleSelect(routeKey)}
                                    sx={{
                                        cursor: "pointer",
                                        padding: "18px 20px", 
                                        minHeight: "80px",
                                        display: "flex",
                                        alignItems: "center",
                                        borderRadius: 2,
                                        margin: "0 8px",
                                        backgroundColor: routeKey === selectedRouteID 
                                            ? (theme === "light" ? 'rgba(25, 118, 210, 0.12)' : 'rgba(144, 202, 249, 0.12)')
                                            : 'transparent',
                                        border: routeKey === selectedRouteID 
                                            ? (theme === "light" ? '2px solid rgba(25, 118, 210, 0.3)' : '2px solid rgba(144, 202, 249, 0.3)')
                                            : '2px solid transparent',
                                        transition: 'all 0.2s ease-in-out',
                                        '&:hover': {
                                            backgroundColor: routeKey === selectedRouteID 
                                                ? (theme === "light" ? 'rgba(25, 118, 210, 0.16)' : 'rgba(144, 202, 249, 0.16)')
                                                : (theme === "light" ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)'),
                                            transform: 'translateY(-1px)',
                                            boxShadow: theme === "light" 
                                                ? '0 4px 12px rgba(0, 0, 0, 0.1)' 
                                                : '0 4px 12px rgba(0, 0, 0, 0.3)',
                                        },
                                        boxShadow: routeKey === selectedRouteID 
                                            ? (theme === "light" ? '0 2px 8px rgba(25, 118, 210, 0.2)' : '0 2px 8px rgba(144, 202, 249, 0.2)')
                                            : 'none',
                                    }}
                                >
                                    <ListItemAvatar>
                                        <Avatar
                                            variant="rounded"
                                            src={routeList}
                                            sx={{
                                                width: 56, 
                                                height: 56,
                                                borderRadius: 2,
                                                border: routeKey === selectedRouteID 
                                                    ? (theme === "light" ? '2px solid rgba(25, 118, 210, 0.3)' : '2px solid rgba(144, 202, 249, 0.3)')
                                                    : '2px solid transparent',
                                            }}
                                        />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="subtitle1" 
                                                component="span"  
                                                sx={{ 
                                                    fontWeight: 700,
                                                    color: routeKey === selectedRouteID 
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
                {/* Enhanced Stop Information Card */}
                {selectedRoute && selectedStopID && (() => {
                    const selectedStop = selectedRoute.stops.find(stop => stop.code === selectedStopID);
                    if (!selectedStop) return null;
                    
                    return (
                        <Box
                            sx={{
                                backgroundColor: theme === "light" ? 'rgba(76, 175, 80, 0.08)' : 'rgba(129, 199, 132, 0.08)', 
                                borderRadius: 0, 
                                p: 2,
                                minHeight: '140px',
                                height: '140px',
                                border: theme === "light" ? '1px solid rgba(76, 175, 80, 0.2)' : '1px solid rgba(129, 199, 132, 0.2)',
                                borderLeft: 'none',
                                borderRight: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            {/* Stop Header */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 4 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <DirectionsBus color="success" fontSize="small" />
                                    <Typography variant="body2" color="success.main" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                                        PARADA ACTUAL
                                    </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {selectedStop.is_main && (
                                        <Typography variant="body2" color="warning.main" sx={{ 
                                            backgroundColor: 'rgba(255, 193, 7, 0.1)', 
                                            px: 1, 
                                            py: 0.3, 
                                            borderRadius: 1,
                                            fontSize: '0.7rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}>
                                            <Star sx={{ fontSize: 12 }} />
                                            PRINCIPAL
                                        </Typography>
                                    )}
                                    
                                    {(() => {
                                        const currentIndex = selectedRoute.stops?.findIndex(
                                            stop => stop.name === selectedStop.name
                                        );
                                        const totalStops = selectedRoute.stops?.length || 0;
                                        
                                        if (currentIndex !== -1 && totalStops > 0) {
                                            return (
                                                <Typography variant="body2" color="text.secondary" sx={{ 
                                                    backgroundColor: 'action.hover', 
                                                    px: 1, 
                                                    py: 0.3, 
                                                    borderRadius: 1,
                                                    fontSize: '0.7rem'
                                                }}>
                                                    {currentIndex + 1} DE {totalStops}
                                                </Typography>
                                            );
                                        }
                                        return null;
                                    })()}
                                </Box>
                            </Box>

                            {/* Stop Content */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                {/* Stop Name and Code */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h4" color="text.primary" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
                                        {selectedStop.name}
                                    </Typography>
                                    {selectedStop.code && (
                                        <Typography variant="body2" color="text.secondary" sx={{ 
                                            fontWeight: 500, 
                                            mt: 0.5,
                                            opacity: 0.8
                                        }}>
                                            Código: {selectedStop.code}
                                        </Typography>
                                    )}
                                </Box>

                                {/* Fare Preview */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'flex-end',
                                    gap: 0.5,
                                    ml: 2
                                }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <LocalAtm sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                            Tarifas
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Typography variant="body2" sx={{ 
                                            color: '#FBC02D', 
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}>
                                            ₡{selectedStop.gold_fare}
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: 'secondary.main', 
                                            fontWeight: 600,
                                            fontSize: '0.9rem'
                                        }}>
                                            ₡{selectedStop.fare}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    );
                })()}

                <List sx={{ p: 0, mt: 1 }}>
                    {selectedRoute.stops.map((stop) => {
                        const isSelected = stop.code === selectedStopID;
                        const passengerCount = getCount(stop);
                        
                        return (
                            <ListItem key={stop.code} disablePadding sx={{ mb: 1 }}>
                                <ListItemButton
                                    key={stop.code}
                                    selected={isSelected}
                                    onClick={() => handleSelectStop(stop.code)}
                                    sx={{
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
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
                                        <ListItemAvatar>
                                            <Avatar
                                                variant="rounded"
                                                src={stopList}
                                                sx={{
                                                    width: 56, 
                                                    height: 56,
                                                    borderRadius: 2,
                                                    border: isSelected 
                                                        ? (theme === "light" ? '2px solid rgba(76, 175, 80, 0.3)' : '2px solid rgba(129, 199, 132, 0.3)')
                                                        : '2px solid transparent',
                                                }}
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
                                        sx={{
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
                                        }}
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
            </Grid>

            {/* Ticket Purchase Dialog */}
            <TicketPurchaseDialog
                open={showPurchaseDialog}
                onClose={handlePurchaseCancel}
                onConfirm={handlePurchaseConfirm}
                ticketType={purchaseTicketType}
                route={selectedRoute}
                stop={selectedRoute.stops.find(stop => stop.code === selectedStopID) || null}
                selectedTime={selectedTime}
            />
        </Grid>
    );
};

export default Ticket;