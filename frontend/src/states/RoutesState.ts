import {create} from "zustand/index";
import {models} from "../../wailsjs/go/models";
import { GetRoutes } from "../../wailsjs/go/services/RouteService";

type RoutesState = {
    routes: models.Route[];

    routesLoading: boolean;
}

type Actions = {
    fetchRoutes: () => void;
    resetRoutesState: () => void;
}

const initialState: RoutesState = {
    routes: [],
    routesLoading: true,
}

export const useRoutesState = create<RoutesState & Actions>()((set) => ({
    ...initialState,
    fetchRoutes: () => {
        set({ routesLoading: true });
        GetRoutes().then((routes: models.Route[]) => {
            set({ routes, routesLoading: false });
        }).catch((error) => {
            set({ routesLoading: false });
        });
    },
    resetRoutesState: () => {
        set(initialState)
    },
}))

