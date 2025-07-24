import {CSSObject, styled, Theme} from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import {AppBarProps as MuiAppBarProps} from "@mui/material/AppBar/AppBar";
import MuiAppBar from "@mui/material/AppBar";

const homeDrawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: homeDrawerWidth,
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up("sm")]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

interface AppBarProps extends MuiAppBarProps {
    open?: boolean;
}

export const HomeAppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    variants: [
        {
            props: ({ open }: { open: boolean }) => open,
            style: {
                marginLeft: homeDrawerWidth,
                width: `calc(100% - ${homeDrawerWidth}px)`,
                transition: theme.transitions.create(["width", "margin"], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.enteringScreen,
                }),
            },
        },
    ],
}));

export const HomeDrawer = styled(MuiDrawer, {
    shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
    width: homeDrawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    variants: [
        {
            props: ({ open }: { open: boolean }) => open,
            style: {
                ...openedMixin(theme),
                "& .MuiDrawer-paper": openedMixin(theme),
            },
        },
        {
            props: ({ open }: { open: boolean }) => !open,
            style: {
                ...closedMixin(theme),
                "& .MuiDrawer-paper": closedMixin(theme),
            },
        },
    ],
}));

export const HomeDrawerHeader = styled("div")(({ theme }) => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    backgroundColor: theme.palette.primary.main,
    ...theme.mixins.toolbar, // necessary for content to be below app bar
}));