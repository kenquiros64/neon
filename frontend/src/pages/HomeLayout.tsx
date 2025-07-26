import React, {useEffect} from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {Outlet, useLocation} from "react-router-dom";
import {
  DirectionsBus,
  Logout,
  NotesOutlined,
} from "@mui/icons-material";
import {useNavigate} from "react-router";
import {HomeAppBar, HomeDrawer, HomeDrawerHeader} from "../components/HomeDrawer";
import {ThemeSwitch} from "../components/ThemeSwitch";
import {useTheme} from "../themes/ThemeProvider";
import {useAuthState} from "../states/AuthState";
import {useTicketState} from "../states/TicketState";
import {useRoutesState} from "../states/RoutesState";

const routes: { [key: string]: string } = {
  "/home": "Boleteria",
  "/home/ticket": "Boleteria",
  "/home/reports": "Reportes",
};

const HomeLayout: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { user, logout } = useAuthState();
  const { resetTicketState } = useTicketState();
  const { resetRoutesState } = useRoutesState();

  const pageTitle: string = routes[location.pathname] || "Página desconocida";

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const formattedTime = `${now.toLocaleDateString("es-CR", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })} ${now.toLocaleTimeString("es-CR", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
      setCurrentTime(formattedTime);
    }, 1000);

    return () => clearInterval(interval); // Cleanup
  }, []);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <HomeAppBar position="fixed" open={open}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left: Page Title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={[ { marginRight: 4 }, open && { display: "none" }]}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h5" component="div">
              {pageTitle}
            </Typography>
          </Box>
          {/* Right: username, time, and switch */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
           
            {/* Username */}
            <Typography variant="body1">
              <span style={{ fontWeight: 200 }}>Bienvenido(a)</span>{" "}
              <span style={{ fontWeight: "bold" }}>{user?.name}</span>
            </Typography>
            <Divider orientation="vertical" flexItem />
            {/* Current Time */}
            <Typography variant="body1">{currentTime}</Typography>
            <Divider orientation="vertical" flexItem />
             {/* Switch Button */}
             <ThemeSwitch
                checked={theme === "dark"}
                onChange={toggleTheme}
                aria-label="theme toggle"
            />
          </Box>
        </Toolbar>
      </HomeAppBar>
      <HomeDrawer variant="permanent" open={open}>
        <HomeDrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon sx={{ color:"white" }} />
          </IconButton>
        </HomeDrawerHeader>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={[
                {
                  minHeight: 48,
                  px: 2.5,
                },
                open ? { justifyContent: "initial" } : { justifyContent: "center" },
              ]}
              onClick={() => navigate("ticket")}
              selected={location.pathname === "/home/ticket" || location.pathname === "/home"}
            >
              <ListItemIcon
                sx={[
                  {
                    minWidth: 0,
                    justifyContent: "center",
                  },
                  open ? { mr: 3 } : { mr: "auto" },
                ]}
              >
                <DirectionsBus />
              </ListItemIcon>
              <ListItemText
                primary={"Boleteria"}
                sx={[open ? { opacity: 1 } : { opacity: 0 }]}
              />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={[
                {
                  minHeight: 48,
                  px: 2.5,
                },
                open ? { justifyContent: "initial" } : { justifyContent: "center" },
              ]}
              selected={location.pathname === "/home/reports"}
              onClick={() => navigate("reports")}
            >
              <ListItemIcon
                sx={[
                  {
                    minWidth: 0,
                    justifyContent: "center",
                  },
                  open ? { mr: 3 } : { mr: "auto" },
                ]}
              >
                <NotesOutlined />
              </ListItemIcon>
              <ListItemText
                primary={"Reportes"}
                sx={[open ? { opacity: 1 } : { opacity: 0 }]}
              />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <List>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={[
                {
                  minHeight: 48,
                  px: 2.5,
                },
                open ? { justifyContent: "initial" } : { justifyContent: "center" },
              ]}
                onClick={() => {
                  logout();
                  resetRoutesState();
                  resetTicketState();
                }}
            >
              <ListItemIcon
                sx={[
                  {
                    minWidth: 0,
                    justifyContent: "center",
                  },
                  open ? { mr: 3 } : { mr: "auto" },
                ]}
              >
                <Logout />
              </ListItemIcon>
              <ListItemText
                primary={"Cerrar Sesión"}
                sx={[open ? { opacity: 1 } : { opacity: 0 }]}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </HomeDrawer>
      {/* Main Content */}
      <Box component="main" sx={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "100vh" }}>
        <HomeDrawerHeader />
        <Box sx={{ flexGrow: 1, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default HomeLayout;
