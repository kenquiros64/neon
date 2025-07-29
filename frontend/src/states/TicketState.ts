import {create} from "zustand/index";
import {models} from "../../wailsjs/go/models";
import {CounterMap} from "../models/CounterMap";
import { fullRouteName, 
    generateCounterKey, 
    generateCounterPrefixesKeys, 
    to24HourFormat 
} from "../util/Helpers";
import { GetAllCountsFromToday, Increment } from "../../wailsjs/go/services/CounterService";


type TicketState = {
    // SELECTED
    selectedRoute: models.Route;
    selectedStop: models.Stop;
    selectedTime: models.Time;

    // VALUES
    code: string;
    routeTimeCounts: CounterMap;
    currentCount: number;
    currentGoldCount: number;
    routes: models.Route[];
}

type Actions = {
    setSelectedRoute: (route: models.Route) => void;
    setSelectedStop: (stop: models.Stop) => void;
    setSelectedTime: (time: models.Time) => void;
    setCode: (code: string) => void;

    incrementCount: (qty: number, type: "regular" | "gold") => void;
    getAllCounts: () => void;
    resetTicketState: () => void;
    getCount: (stop: models.Stop) => number;
}

const initialState: TicketState = {
    selectedRoute: {
        departure: "",
        destination: "",
        stops: [],
        timetable: [],
        holiday_timetable: [],
        id: [],
        convertValues: () => {},
    },
    selectedStop: {
        name: "",
        code: "",
        is_main: false,
        fare: 0,
        gold_fare: 0,
    },
    selectedTime: { hour: 0, minute: 0 },

    code: "",
    routeTimeCounts: {},
    routes: [],
    currentCount: 0,
    currentGoldCount: 0,
}

export const useTicketState = create<TicketState & Actions>()((set, get) => ({
    ...initialState,
    setSelectedRoute: (route: models.Route) => {
        set({ selectedRoute: route })
    },
    setSelectedStop: (stop: models.Stop) => {
        set({ selectedStop: stop })
    },
    setSelectedTime: (time: models.Time) => {
        set({ selectedTime: time })
    },
    setCode: (code: string) => {
        set({ code: code })
    },
    incrementCount: (qty: number, type: "regular" | "gold") => {
        const stop = get().selectedStop;
        const time = get().selectedTime;
        const route = get().selectedRoute;

        const routeTimeCounts = get().routeTimeCounts;

        let key = generateCounterKey(route, stop, time, type === "gold");

        Increment(key, qty).then((count: models.Count) => {
            // Update the current counts
            if (type === "gold") {
                set({ currentGoldCount: count.value });
            } else {
                set({ currentCount: count.value });
            }
            
            const updatedRouteCounts = { ...routeTimeCounts };
            updatedRouteCounts[key] = count.value;
            set({ routeTimeCounts: updatedRouteCounts });
        }).catch((error) => {
            console.error("Error incrementing count:", error);
        });
    },
    getAllCounts: () => {
        GetAllCountsFromToday().then((counts: models.Count[]) => {
            let counterMap: CounterMap = {};
            for (let count of counts) {
                counterMap[count.key] = count.value;
            }
            set({ routeTimeCounts: counterMap });
            
            // Update current counts after loading all counts
            const state = get();
            const stop = state.selectedStop;
            const route = state.selectedRoute;
            const time = state.selectedTime;

            if (route && stop && time) {
                const key = generateCounterKey(route, stop, time, false);
                const goldKey = generateCounterKey(route, stop, time, true);
                
                set({ 
                    currentCount: counterMap[key] || 0,
                    currentGoldCount: counterMap[goldKey] || 0
                });
            }
        }).catch((error) => {
            console.error("Error getting all counts:", error);
        });
    },
    getCount: (stop: models.Stop) => {
        const time = get().selectedTime;
        const route = get().selectedRoute;

        const key = generateCounterKey(route, stop, time, false);
        const goldKey = generateCounterKey(route, stop, time, true);

        const count = get().routeTimeCounts[key] || 0;
        const goldCount = get().routeTimeCounts[goldKey] || 0;
        
        return count + goldCount;
    },
    resetTicketState: () => {
        set(initialState)
    },
}))
  