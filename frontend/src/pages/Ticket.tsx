import React from 'react';
import { Box, Grid, Divider, CircularProgress } from "@mui/material";
import StartReport from "../components/StartReport";
import TicketPurchaseDialog from "../components/TicketPurchaseDialog";
import { RouteInfoCard } from "../components/RouteInfoCard";
import { StopInfoCard } from "../components/StopInfoCard";
import { RouteList } from "../components/RouteList";
import { StopList } from "../components/StopList";
import { TicketInputSection } from "../components/TicketInputSection";
import { useReportStatus } from "../hooks/useReportStatus";
import { useTicketSelection } from "../hooks/useTicketSelection";
import { useTicketPurchase } from "../hooks/useTicketPurchase";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { useRoutesState } from '../states/RoutesState';
import { useTicketState } from "../states/TicketState";
import { useAuthState } from "../states/AuthState";
import { useReportState } from '../states/ReportState';


const Ticket: React.FC = () => {
    const { routes, routesLoading } = useRoutesState();
    const { selectedRoute, selectedTime, getCount, incrementCount } = useTicketState();
    const { user } = useAuthState();
    const { report, reportLoading } = useReportState();

    // Custom hooks
    const { showStartReportDialog, reportStatusChecked } = useReportStatus();
    
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

    if (routesLoading) {
        return null;
    }

    // Get the selected stop for display
    const selectedStop = selectedRoute?.stops?.find(stop => stop.code === selectedStopID);

    return (
        <Grid container sx={{ height: "100%", margin: 0 }}>
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
            <Grid
                size="grow"
                sx={{
                    height: "100%",
                    maxHeight: "500px",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                <RouteInfoCard route={selectedRoute} />
                <RouteList
                    routes={routes}
                    selectedRouteID={selectedRouteID}
                    onRouteSelect={handleRouteSelect}
                    report={report}
                />
            </Grid>

            <Divider sx={{ height: "100%" }} orientation="vertical" flexItem />

            {/* Right Panel - Stops */}
            <Grid
                size="grow"
                sx={{
                    height: "100%",
                    maxHeight: "500px",
                    overflowY: "auto",
                    overflowX: "hidden",
                }}
            >
                <StopInfoCard stop={selectedStop} route={selectedRoute} />
                {selectedRoute && (
                    <StopList
                        stops={selectedRoute.stops}
                        selectedStopID={selectedStopID}
                        onStopSelect={handleStopSelect}
                        getCount={getCount}
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
    );
};

export default Ticket;