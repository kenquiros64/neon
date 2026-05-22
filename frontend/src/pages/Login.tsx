import React, {useEffect, useState} from "react";
import {TextField, Box, Typography, Grid, Paper} from "@mui/material";
import { Button } from '@mui/material'
import {useNavigate} from "react-router";

import heroBanner from "../assets/images/hero-banner.png";
import logo from "../assets/images/white_logo.png";

import {useTheme} from "../themes/ThemeProvider";
import {ThemeSwitch} from "../components/ThemeSwitch";
import CssBaseline from "@mui/material/CssBaseline";
import {ArrowForward} from "@mui/icons-material";
import {useAuthState} from "../states/AuthState";
import {toast} from "react-toastify";

import {SyncRoutes, SyncUsers} from "../../wailsjs/go/services/SyncService";
import { loginErrorMessages } from "../util/ErrorMessages";

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isReady, setIsReady] = useState(true);
    const [inputError, setInputError] = useState({username: "", password: ""});
    const [loading, setLoading] = useState(false);
    const {login} = useAuthState();
    const navigate = useNavigate();

    const {theme, toggleTheme} = useTheme();

    useEffect(() => {
        SyncUsers().then(() => {
            toast.success("Usuarios sincronizados correctamente");
        }).catch((error) => {
            if (error === "NO_INTERNET_CONNECTION") {
                toast.warning("No es posible sincronizar las rutas sin conexión a internet");
                return;
            }
            console.error("Error al sincronizar los usuarios:", error);
            toast.error("Error al sincronizar los usuarios");
        });

        SyncRoutes().then(() => {
            toast.success("Rutas sincronizadas correctamente");
        }).catch((error) => {
            if (error === "ROUTE_IS_EMPTY") {
                toast.error("Una ruta tiene datos faltantes. Por favor, contacta al administrador.");
                setIsReady(false);
                return;
            }
            if (error === "NO_INTERNET_CONNECTION") {
                toast.warning("No es posible sincronizar las rutas sin conexión a internet");
                return;
            }
            console.error("Error al sincronizar las rutas:", error);
            toast.error("Error al sincronizar las rutas");
        });
    }, []);

    const handleLogin = async () => {
        if (!username) {
            setInputError({username: "Usuario es requerido", password: ""});
            return;
        }
        if (!password) {
            setInputError({username: "", password: "Contraseña es requerida"});
            return;
        }

        setLoading(true);
        login(username, password)
            .then(() => {
                navigate("/home");
            })
            .catch((error) => {
                if (error === "USER_NOT_FOUND") {
                    setInputError({username: loginErrorMessages[error], password: ""});
                }
                if (error === "USER_INVALID_PASSWORD") {
                    setInputError({username: "", password: loginErrorMessages[error]});
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <Grid container sx={{height: "100vh", margin: 0}}>
            <CssBaseline/>

            {/* Left — login form (keeps bus & ticket visible on the right panel) */}
            <Grid
                size={{xs: 12, md: 5, lg: 5}}
                sx={{
                    height: "100%",
                    order: {xs: 2, md: 1},
                }}
            >
                <Box sx={{
                    position: 'relative',
                    width: "100%",
                    height: "100%",
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default',
                }}>
                    <ThemeSwitch
                        checked={theme === "dark"}
                        onClick={toggleTheme}
                        sx={{ position: "absolute", top: 12, right: 12, zIndex: 1 }}
                    />

                    <Box sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: {xs: 3, md: 4, lg: 6},
                        py: {xs: 4, md: 0},
                    }}>
                        <Paper
                            elevation={0}
                            sx={{
                                width: '100%',
                                maxWidth: 420,
                                p: 4,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Typography variant="h4" fontWeight={700} mb={0.5}>
                                Bienvenidos
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                mb={4}
                                fontWeight={400}
                            >
                                Gestión rápida y sencilla para el transporte de pasajeros
                            </Typography>

                            <Box component="form" noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                <TextField
                                    label="Usuario"
                                    variant="outlined"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setInputError((prev) => ({...prev, username: ""}));
                                    }}
                                    error={inputError.username !== ""}
                                    helperText={inputError.username || ""}
                                />
                                <TextField
                                    label="Contraseña"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setInputError((prev) => ({...prev, password: ""}));
                                    }}
                                    error={inputError.password !== ""}
                                    helperText={inputError.password || ""}
                                />

                                <Button
                                    fullWidth
                                    loading={loading}
                                    loadingPosition="end"
                                    disabled={!isReady}
                                    size="large"
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 1, fontWeight: 700, py: 1.5 }}
                                    onClick={handleLogin}
                                    endIcon={<ArrowForward/>}
                                >
                                    Ingresar
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                </Box>
            </Grid>

            {/* Right — hero banner (bus & ticket artwork) */}
            <Grid
                size={{xs: 12, md: 7, lg: 7}}
                sx={{
                    height: {xs: 280, md: "100%"},
                    order: {xs: 1, md: 2},
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        backgroundImage: `url(${heroBanner})`,
                        backgroundSize: "cover",
                        backgroundPosition: "right center",
                        backgroundRepeat: "no-repeat",
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <Box sx={{
                        position: "absolute",
                        inset: 0,
                        background: 'linear-gradient(90deg, rgba(8, 18, 38, 0.92) 0%, rgba(8, 18, 38, 0.35) 45%, rgba(8, 18, 38, 0.1) 100%)',
                        pointerEvents: 'none',
                    }} />
                    <Box sx={{
                        position: "absolute",
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
                        pointerEvents: 'none',
                    }} />

                    <Box sx={{ position: 'relative', p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            component="img"
                            src={logo}
                            alt="Logo"
                            sx={{ width: 64, height: 'auto', objectFit: "contain" }}
                        />
                    </Box>

                    <Box sx={{ position: 'relative', p: 4, textAlign: {xs: 'center', md: 'right'} }}>
                        <Typography variant="h3" fontWeight={700} color="white" lineHeight={1.1}>
                            Transportes
                        </Typography>
                        <Typography variant="h4" fontWeight={300} color="rgba(255,255,255,0.85)">
                            El Puma Pardo S.A
                        </Typography>
                        <Typography variant="body2" color="rgba(255,255,255,0.5)" sx={{ mt: 1 }}>
                            oxygen 1.0.0
                        </Typography>
                    </Box>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
