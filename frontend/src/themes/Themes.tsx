import { createTheme } from "@mui/material/styles";

const sharedComponents = {
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                fontWeight: 600,
                borderRadius: 6,
            },
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                transition: 'all 0.2s ease-in-out',
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 12,
            },
        },
    },
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                textTransform: 'none' as const,
                fontWeight: 600,
            },
        },
    },
};

const lightTheme = createTheme({
    shape: { borderRadius: 8 },
    palette: {
        mode: 'light',
        primary: {
            main: '#2196F3',
            light: '#2EA6D5',
            dark: '#1565C0',
        },
        secondary: {
            main: '#8BC34A',
            light: '#A2CF6E',
            dark: '#71A436',
            contrastText: '#FFF',
        },
        info: {
            main: '#2196F3',
            light: '#64B5F6',
            dark: '#1565C0',
            contrastText: '#FFF',
        },
        warning: {
            main: '#FBC02D',
            light: '#FDD835',
            dark: '#F9A825',
            contrastText: '#FFF',
        },
    },
    components: sharedComponents,
});

const darkTheme = createTheme({
    shape: { borderRadius: 8 },
    palette: {
        mode: "dark",
        primary: {
            main: '#2196F3',
            light: '#2EA6D5',
            dark: '#1565C0',
        },
        secondary: {
            main: '#8BC34A',
            light: '#A2CF6E',
            dark: '#618833',
            contrastText: '#FFF',
        },
        info: {
            main: '#64B5F6',
            light: '#90CAF9',
            dark: '#2196F3',
            contrastText: '#FFF',
        },
        warning: {
            main: '#FFD600',
            light: '#FFDE33',
            dark: '#B29500',
            contrastText: '#FFF',
        },
    },
    components: sharedComponents,
});

export { lightTheme, darkTheme };
