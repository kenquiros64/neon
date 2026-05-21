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
  Route as RouteIcon,
  People,
  Print,
  Warning,
} from "@mui/icons-material";
import Chip from "@mui/material/Chip";
import {useNavigate} from "react-router";
import {HomeAppBar, HomeDrawer, HomeDrawerHeader} from "../components/HomeDrawer";
import {ThemeSwitch} from "../components/ThemeSwitch";
import {useTheme} from "../themes/ThemeProvider";
import {useAuthState} from "../states/AuthState";
import {useTicketState} from "../states/TicketState";
import {useRoutesState} from "../states/RoutesState";
import { useReportState } from "../states/ReportState";
import { usePrinters } from "../hooks/usePrinters";

const routes: { [key: string]: string } = {
  "/home": "Boleteria",
  "/home/ticket": "Boleteria",
  "/home/reports": "Reportes",
  "/home/admin/routes": "Rutas",
  "/home/admin/users": "Usuarios",
};

const HomeLayout: React.FC = () => {
  const [open, setOpen] = React.useState(false);
  const [currentTime, setCurrentTime] = React.useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const { user, logout } = useAuthState();
  const isAdmin = user?.role === "admin";
  const { resetTicketState } = useTicketState();
  const { resetRoutesState } = useRoutesState();
  const { resetReportState } = useReportState();
  const { defaultPrinter, status: printerStatus, statusMessage } = usePrinters();
  const isTicketPage = location.pathname === "/home" || location.pathname === "/home/ticket";

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
          {/* Right: printer (ticket page), username, time, and switch */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isTicketPage && defaultPrinter && (
              <>
                <Chip
                  icon={printerStatus === "ready" ? <Print /> : <Warning />}
                  label={printerStatus === "ready" ? `Impresora: ${defaultPrinter}` : statusMessage || "Impresora no disponible"}
                  color={printerStatus === "ready" ? "success" : "warning"}
                  size="small"
                  variant="outlined"
                  sx={{ color: "inherit", borderColor: "currentColor" }}
                />
                <Divider orientation="vertical" flexItem />
              </>
            )}
            {/* Username */}
            <Typography variant="body2" sx={{ fontWeight: 400 }}>
              Bienvenido(a){" "}
              <strong>{user?.name}</strong>
            </Typography>
            <Divider orientation="vertical" flexItem />
            {/* Current Time */}
            <Typography variant="body2" sx={{ fontWeight: 600 }}>{currentTime}</Typography>
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
        <List sx={{ px: 1 }}>
          {[
            { label: "Boleteria", icon: <DirectionsBus />, path: "ticket", match: ["/home/ticket", "/home"] },
            { label: "Reportes", icon: <NotesOutlined />, path: "reports", match: ["/home/reports"] },
            ...(isAdmin ? [
              { label: "Rutas", icon: <RouteIcon />, path: "admin/routes", match: ["/home/admin/routes"] },
              { label: "Usuarios", icon: <People />, path: "admin/users", match: ["/home/admin/users"] },
            ] : []),
          ].map(({ label, icon, path, match }) => {
            const isSelected = match.includes(location.pathname);
            return (
              <ListItem key={label} disablePadding sx={{ display: "block", mb: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => navigate(path)}
                  sx={[
                    {
                      minHeight: 44,
                      px: 1.5,
                      borderRadius: 2,
                      borderLeft: isSelected ? '3px solid' : '3px solid transparent',
                      borderLeftColor: isSelected ? 'primary.main' : 'transparent',
                      backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                      '&:hover': {
                        backgroundColor: isSelected ? 'rgba(33, 150, 243, 0.14)' : 'action.hover',
                      },
                    },
                    open ? { justifyContent: "initial" } : { justifyContent: "center" },
                  ]}
                >
                  <ListItemIcon
                    sx={[
                      { minWidth: 0, justifyContent: "center", color: isSelected ? 'primary.main' : 'inherit' },
                      open ? { mr: 2 } : { mr: "auto" },
                    ]}
                  >
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{ fontWeight: isSelected ? 700 : 400, fontSize: '0.9rem' }}
                    sx={[open ? { opacity: 1 } : { opacity: 0 }]}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
        <Divider />
        <List sx={{ px: 1 }}>
          <ListItem disablePadding sx={{ display: "block" }}>
            <ListItemButton
              sx={[
                { minHeight: 44, px: 1.5, borderRadius: 2 },
                open ? { justifyContent: "initial" } : { justifyContent: "center" },
              ]}
              onClick={() => {
                resetRoutesState();
                resetTicketState();
                resetReportState();
                logout();
              }}
            >
              <ListItemIcon
                sx={[
                  { minWidth: 0, justifyContent: "center" },
                  open ? { mr: 2 } : { mr: "auto" },
                ]}
              >
                <Logout />
              </ListItemIcon>
              <ListItemText
                primary={"Cerrar Sesión"}
                primaryTypographyProps={{ fontSize: '0.9rem' }}
                sx={[open ? { opacity: 1 } : { opacity: 0 }]}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </HomeDrawer>
      {/* Main Content */}
      <Box component="main" sx={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "100vh" }}>
        <HomeDrawerHeader />
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            overflow: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default HomeLayout;
