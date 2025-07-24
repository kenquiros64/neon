import { createTheme } from "@mui/material/styles";

const lightTheme = createTheme({
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
            dark: '#618833',
            contrastText: '#FFF',
        },
        info: {
            main: '#FFD600',
            light: '#FFDE33',
            dark: '#B29500',
            contrastText: '#FFF',
        }
    },
});

const darkTheme = createTheme({
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
            main: '#FFD600',
            light: '#FFDE33',
            dark: '#B29500',
            contrastText: '#FFF',
        }
  },
});

export { lightTheme, darkTheme };