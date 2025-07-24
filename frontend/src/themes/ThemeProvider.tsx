import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
// import { LazyStore } from "@tauri-apps/plugin-store";
import {darkTheme, lightTheme} from "./Themes";

type Theme = "light" | "dark";

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

// Create the Tauri store instance
// const store = new LazyStore(".settings.dat");

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<Theme>("light");

    // Save theme to Tauri store
    const saveTheme = async (theme: Theme) => {
        try {
            // await store.set("theme", theme);
            // await store.save();
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
    };

    // Load theme from Tauri store
    const loadTheme = async () => {
        try {
            // const storedTheme = await store.get("theme");
            // if (storedTheme) {
            //     setThemeState(storedTheme as Theme);
            // }
        } catch (error) {
            console.error("Failed to load theme:", error);
        }
    };

    const setTheme = (theme: Theme) => {
        setThemeState(theme);
        saveTheme(theme).then(() => console.log("Theme saved"));
    };

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
    };

    useEffect(() => {
        loadTheme().then(() => console.log("Theme loaded"));
    }, []);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {/* Apply the correct theme */}
            <MuiThemeProvider theme={theme === "light" ? lightTheme : darkTheme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useTheme = (): ThemeContextProps => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};