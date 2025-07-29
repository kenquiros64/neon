import React, {useEffect, useState} from "react";
import {TextField, Box, Typography, Grid, Paper} from "@mui/material";
import { Button } from '@mui/material'
import {useNavigate} from "react-router";

import backgroundLogo from "../assets/images/background.png";
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
            {/* Left Side */}
            <Grid size={{xs: 12, md: 6}} style={{height: "100%"}}>
                <Box
                    sx={{
                        position: "relative", // Required to position the text over the image
                        backgroundImage: `url(${backgroundLogo})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                    }}
                >
                    <Grid container style={{height: "100vh", width: "100%"}}>
                        <Grid size={12} rowSpacing={2}>
                            <Paper
                                variant="outlined"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    padding: "16px",
                                    backgroundColor: "transparent", // Makes it transparent
                                    boxShadow: "none", // Removes any shadow if needed
                                    border: "none", // Removes the border if not needed
                                }}
                            >
                                {/* Image on the left */}
                                <Box
                                    component="img"
                                    src={logo}
                                    alt="Logo"
                                    sx={{
                                        width: "150px",
                                        height: "110px",
                                        marginRight: "16px",
                                        objectFit: "contain",
                                    }}
                                />

                                {/* Texts on the right */}
                                <Box sx={{textAlign: "left"}}>
                                    <Typography
                                        variant="h4"
                                        component="div"
                                        fontWeight="bold"
                                        color={"grey.300"}
                                    >
                                        Transportes
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        component="div"
                                        color={"grey.300"}
                                        fontWeight={200}
                                    >
                                        El Puma Pardo S.A
                                    </Typography>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid
                            size={12}
                            rowSpacing={2}
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                right: 0,
                                padding: "8px",
                                textAlign: "right",
                            }}
                        >
                            <Typography
                                variant="body2"
                                component={"div"}
                                color={"grey.300"}
                                fontWeight={200}
                                fontSize={14}
                            >
                                oxygen 1.0.0
                            </Typography>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>

            {/* Right Side */}
            <Grid size={{xs: 12, md: 6}} style={{height: "100%"}}>
                <Box sx={{width: "100%"}}>
                    <ThemeSwitch
                        checked={theme === "dark"}
                        onClick={toggleTheme}
                        sx={{
                            position: "absolute",
                            top: 5,
                            right: 5,
                        }}
                    />
                    <Grid
                        container
                        sx={{
                            width: "100%",
                            height: "100vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Grid
                            size={{xs: 12}}
                            sx={{
                                margin: 10,
                                width: "100%",
                            }}
                        >
                            <Typography variant="h2" textAlign="left">
                                Bienvenidos
                            </Typography>
                            <Typography
                                variant="subtitle1"
                                textAlign="left"
                                mb={5}
                                color={"primary"}
                                fontWeight={200}
                            >
                                Gestión rápida y sencilla para el transporte de pasajeros
                            </Typography>

                            <Typography
                                variant="h5"
                                textAlign="center"
                                mb={2}
                                fontWeight={200}
                            >
                                Iniciar Sesión
                            </Typography>
                            {/* Fields */}
                            <Box component="form" noValidate>
                                <TextField
                                    label="Username"
                                    variant="outlined"
                                    fullWidth
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        setInputError((prev) => ({...prev, username: ""}));
                                    }}
                                    error={inputError.username !== ""}
                                    helperText={inputError.username ? inputError.username : ""}
                                    style={{marginBottom: "2rem"}}
                                />
                                <TextField
                                    label="Password"
                                    type="password"
                                    variant="outlined"
                                    fullWidth
                                    value={password}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                        setInputError((prev) => ({...prev, password: ""}));
                                    }}
                                    error={inputError.password !== ""}
                                    helperText={inputError.password ? inputError.password : ""}
                                    style={{marginBottom: "2rem"}}
                                />

                                {/* Login Button */}
                                <Button
                                    fullWidth
                                    loading={loading}
                                    loadingPosition={"end"}
                                    disabled={!isReady}
                                    size={"large"}
                                    variant="contained"
                                    color="secondary"
                                    sx={{fontSize: 17, fontWeight: "200"}}
                                    onClick={handleLogin}
                                    endIcon={<ArrowForward/>}
                                >
                                    Ingresar
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
