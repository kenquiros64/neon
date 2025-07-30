import { create } from "zustand";
import {models} from "../../wailsjs/go/models";
import {Login} from "../../wailsjs/go/services/AuthService";

type AuthState = {
    user: models.User | null;
}

type Actions = {
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const initialState: AuthState = {
    user: null,
}

export const useAuthState = create<AuthState & Actions>()((set) => ({
    ...initialState,
    login: (username, password) => {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const user: models.User = await Login(username, password);
                set({ user: user });
                resolve();
            } catch (error) {
                set({ user: initialState.user });
                reject(error as Error); // Mark the promise as failed
            }
        });
    },
    logout: () => {
        set({ user: initialState.user });
    },
}))