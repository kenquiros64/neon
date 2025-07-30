import React from 'react';
import { Box, TextField, Alert, AlertTitle, Typography } from "@mui/material";
import HomeCard from "./HomeCard";

interface TicketInputSectionProps {
    hasPendingReportFromOtherUser: boolean;
    reportUsername?: string;
    code: string;
    onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onShowDialog: (ticketType: 'regular' | 'gold') => void;
    inputRef: React.RefObject<HTMLInputElement>;
}

export const TicketInputSection: React.FC<TicketInputSectionProps> = ({
    hasPendingReportFromOtherUser,
    reportUsername,
    code,
    onCodeChange,
    onShowDialog,
    inputRef
}) => {
    if (hasPendingReportFromOtherUser) {
        return (
            <Alert 
                severity="warning" 
                sx={{ 
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    textAlign: "center"
                }}
            >
                <AlertTitle sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
                    Reporte Pendiente de Otro Usuario
                </AlertTitle>
                <Typography variant="body1" sx={{ mb: 2 }}>
                    Hay un reporte pendiente abierto por <strong>{reportUsername}</strong>.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Para poder vender tiquetes, es necesario cerrar el reporte pendiente desde la sección de Reportes.
                </Typography>
            </Alert>
        );
    }

    return (
        <>
            <Box sx={{ display: "flex", alignItems: "center" }}>
                <TextField
                    fullWidth
                    placeholder="Código"
                    value={code}
                    onChange={onCodeChange}
                    inputRef={inputRef}
                    sx={{ pattern: "[0-9]*", inputMode: "numeric" }}
                />
            </Box>
            <Box sx={{ alignItems: "center", display: "flex", height: "100%" }}>
                <HomeCard onShowDialog={onShowDialog} />
            </Box>
        </>
    );
}; 