import React, {useEffect, useState} from "react";
import {TextField, Box, Typography, Grid, Paper} from "@mui/material";
import {LoadingButton} from "@mui/lab";
import {useNavigate} from "react-router";

import backgroundLogo from "../assets/images/background.png";
import logo from "../assets/images/white_logo.png";

import {useTheme} from "../themes/ThemeProvider";
import {ThemeSwitch} from "../components/ThemeSwitch";
import CssBaseline from "@mui/material/CssBaseline";
import {ArrowForward} from "@mui/icons-material";
import {useAuthState} from "../states/AuthState";
import {toast} from "react-toastify";
import { ErrorResponse } from "../models/ErrorResponse";

import {SyncUsers} from "../../wailsjs/go/services/SyncService";

// import {listen} from "@tauri-apps/api/event";
// import {invoke} from "@tauri-apps/api/core";
// import {ErrorResponse} from "../models/ErrorResponse.ts";

// Listen for the sync-finished event
// listen<ErrorResponse>("sync-finished", (event) => {
//     if (event.payload === null) {
//         toast.success("Datos sincronizados correctamente");
//     } else {
//         toast.info("Datos no sincronizados");
//     }
// });

const Login: React.FC = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [inputError, setInputError] = useState({username: "", password: ""});
    const [loading, setLoading] = useState(false);
    const {login} = useAuthState();
    const navigate = useNavigate();

    const {theme, toggleTheme} = useTheme();

    useEffect(() => {
        SyncUsers().then(() => {
            toast.success("Datos sincronizados correctamente");
        }).catch((error) => {
            toast.error("Error al sincronizar los datos");
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
                navigate("/home"); // Navigate to HomeLayout
            })
            .catch((error: ErrorResponse) => {
                if (error?.code === "USER_NOT_FOUND") {
                    setInputError({username: error.message, password: ""});
                }
                if (error?.code === "USER_INVALID_PASSWORD") {
                    setInputError({username: "", password: error.message});
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
                                <LoadingButton
                                    fullWidth
                                    loading={loading}
                                    loadingPosition={"end"}
                                    size={"large"}
                                    variant="contained"
                                    color="secondary"
                                    sx={{fontSize: 17, fontWeight: "200"}}
                                    onClick={handleLogin}
                                    endIcon={<ArrowForward/>}
                                >
                                    Ingresar
                                </LoadingButton>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            </Grid>
        </Grid>
    );
};

export default Login;
