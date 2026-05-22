import React from 'react';
import { Box, Grid, Divider, CircularProgress } from "@mui/material";
import StartReport from "../components/StartReport";
import TicketPurchaseDialog from "../components/TicketPurchaseDialog";
import { RouteInfoCard } from "../components/RouteInfoCard";
import { StopInfoCard } from "../components/StopInfoCard";
import { RouteList } from "../components/RouteList";
import { StopList } from "../components/StopList";
import { TicketInputSection } from "../components/TicketInputSection";
import { useReportCheck } from "../hooks/useReportCheck";
import { useRoutesManagement } from "../hooks/useRoutesManagement";
import { useStartReportDialog } from "../hooks/useStartReportDialog";
import { useTicketSelection } from "../hooks/useTicketSelection";
import { useTicketPurchase } from "../hooks/useTicketPurchase";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useTicketState } from "../states/TicketState";
import { useAuthState } from "../states/AuthState";
import { useReportState } from '../states/ReportState';
import { fullRouteName } from '../util/Helpers';


const Ticket: React.FC = () => {
    const { selectedRoute, selectedTime, incrementCount } = useTicketState();
    const { user } = useAuthState();
    const { reportLoading } = useReportState();

    // Custom hooks
    const { report, reportStatusChecked } = useReportCheck();
    const { routes, routesLoading } = useRoutesManagement({});
    const { showStartReportDialog } = useStartReportDialog({ 
        reportStatusChecked
    });
    
    const {
        selectedRouteID,
        selectedStopID,
        inputRef,
        code,
        hasPendingReportFromOtherUser,
        handleRouteSelect,
        handleStopSelect,
        handleCodeInput,
        focusInput
    } = useTicketSelection();

    const {
        showPurchaseDialog,
        purchaseTicketType,
        handlePurchaseConfirm,
        handlePurchaseCancel,
        showRegularTicketDialog,
        showGoldTicketDialog,
        handleShowDialogFromHomeCard
    } = useTicketPurchase({
        selectedRoute,
        selectedStopID,
        selectedTime,
        user,
        report,
        incrementCount,
        focusInput
    });

    // Keyboard shortcuts
    useKeyboardShortcuts({
        hasPendingReportFromOtherUser,
        showPurchaseDialog,
        inputRef,
        onRegularTicket: showRegularTicketDialog,
        onGoldTicket: showGoldTicketDialog
    });

    // Loading states
    if (!reportStatusChecked || reportLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (showStartReportDialog) {
        return <StartReport />;
    }

    if (routesLoading || !report) {
        return null;
    }

    const selectedStop = selectedRoute.stops.find(stop => stop.code === selectedStopID) || null;
    const selectedRouteIndex = Math.max(
        0,
        routes.findIndex((r) => fullRouteName(r) === selectedRouteID)
    );

    const panelSx = {
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        height: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderLeft: '1px solid',
        borderRight: '1px solid',
        borderColor: 'divider',
    };

    return (
        <Box
            sx={{
                flex: 1,
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
        <Grid container sx={{ flex: 1, minHeight: 0, margin: 0 }}>
            {/* Left Panel - Ticket Input Section */}
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
                <TicketInputSection
                    hasPendingReportFromOtherUser={hasPendingReportFromOtherUser}
                    reportUsername={report?.username}
                    code={code}
                    onCodeChange={handleCodeInput}
                    onShowDialog={handleShowDialogFromHomeCard}
                    inputRef={inputRef}
                />
            </Grid>

            <Divider sx={{ height: "100%" }} orientation="vertical" flexItem />

            {/* Middle Panel - Routes */}
            <Grid size="grow" sx={panelSx}>
                <RouteInfoCard route={selectedRoute} routeIndex={selectedRouteIndex} />
                <RouteList
                    routes={routes}
                    selectedRouteID={selectedRouteID}
                    onRouteSelect={handleRouteSelect}
                    report={report}
                />
            </Grid>

            <Divider sx={{ height: "100%" }} orientation="vertical" flexItem />

            {/* Right Panel - Stops */}
            <Grid size="grow" sx={panelSx}>
                <StopInfoCard route={selectedRoute} routeIndex={selectedRouteIndex} />
                {selectedRoute && (
                    <StopList
                        stops={selectedRoute.stops}
                        selectedStopID={selectedStopID}
                        onStopSelect={handleStopSelect}
                    />
                )}
            </Grid>

            {/* Ticket Purchase Dialog */}
            <TicketPurchaseDialog
                open={showPurchaseDialog}
                onClose={handlePurchaseCancel}
                onConfirm={handlePurchaseConfirm}
                ticketType={purchaseTicketType}
                route={selectedRoute}
                stop={selectedStop || null}
                selectedTime={selectedTime}
            />
        </Grid>
        </Box>
    );
};

export default Ticket;