import { useState, useEffect, useRef } from 'react';
import { useRoutesState } from '../states/RoutesState';
import { useTicketState } from '../states/TicketState';
import { useReportState } from '../states/ReportState';
import { useAuthState } from '../states/AuthState';
import { fullRouteName, nextDeparture } from '../util/Helpers';

export const useTicketSelection = () => {
    const { routes, routesLoading } = useRoutesState();
    const { report } = useReportState();
    const { user } = useAuthState();
    const {
        selectedRoute,
        setSelectedRoute,
        setSelectedStop,
        setSelectedTime,
        getAllCounts,
        code,
        setCode
    } = useTicketState();

    const [selectedRouteID, setSelectedRouteID] = useState<String | null>(null);
    const [selectedStopID, setSelectedStopID] = useState<String | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const hasPendingReportFromOtherUser = Boolean(report && report.username !== user?.username);

    const focusInput = () => {
        if (!hasPendingReportFromOtherUser) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    };

    const handleRouteSelect = (id: String) => {
        setSelectedRouteID(id);
        const route = routes.find((route) => fullRouteName(route) === id);
        if (!route) return;

        setSelectedRoute(route);
        
        const mainStop = route.stops.find((stop) => stop.is_main);
        if (!mainStop) return;

        setSelectedStop(mainStop);
        setSelectedStopID(mainStop.code);
        setSelectedTime(nextDeparture(route, (report?.timetable as 'regular' | 'holiday') || "regular"));
        getAllCounts();
        focusInput();
    };

    const handleStopSelect = (id: String) => {
        setSelectedStopID(id);
        const stop = selectedRoute.stops.find((stop) => stop.code === id);
        if (!stop) return;

        setSelectedStop(stop);
        getAllCounts();
        focusInput();
    };

    const handleCodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputCode = e.target.value;
        if (!/^\d*$/.test(inputCode)) return;

        setCode(inputCode);

        const route = routes.find((route) => 
            route.stops.find((stop) => stop.code === inputCode)
        );
        if (!route) return;

        const stop = route.stops.find((stop) => stop.code === inputCode);
        if (!stop) return;

        setSelectedRoute(route);
        setSelectedRouteID(fullRouteName(route));
        setSelectedStop(stop);
        setSelectedStopID(stop.code);
        getAllCounts();
        setSelectedTime(nextDeparture(route, (report?.timetable as 'regular' | 'holiday') || "regular"));
        
        setCode("");
        focusInput();
    };

    // Initialize with first route if available
    useEffect(() => {
        if (routesLoading || routes.length === 0) return;

        const firstRoute = routes[0];
        const mainStopIndex = firstRoute.stops.findIndex((stop) => stop.is_main);
        const mainStop = firstRoute.stops[mainStopIndex];

        setSelectedRoute(firstRoute);
        setSelectedRouteID(fullRouteName(firstRoute));
        setSelectedStop(mainStop);
        setSelectedStopID(mainStop.code);
        setSelectedTime(nextDeparture(firstRoute, (report?.timetable as 'regular' | 'holiday') || "regular"));
        getAllCounts();
    }, [routes, routesLoading, report]);

    // Focus input when time changes
    useEffect(() => {
        if (selectedRoute && !hasPendingReportFromOtherUser) {
            focusInput();
        }
    }, [selectedRoute, hasPendingReportFromOtherUser]);

    return {
        selectedRouteID,
        selectedStopID,
        inputRef,
        code,
        hasPendingReportFromOtherUser,
        handleRouteSelect,
        handleStopSelect,
        handleCodeInput,
        focusInput
    };
}; 