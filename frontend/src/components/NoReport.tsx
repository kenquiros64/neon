import React from 'react';
// import { useReportState } from '../states/ReportState';
import {
    Button,
    CardContent,
    Card,
    Typography,
    Box, CardActions
} from '@mui/material';
import {useAuthState} from "../states/AuthState";

const NoReport: React.FC = () => {
    // const { startReport } = useReportState();
    const { user } = useAuthState();

    const handleStartReport = async () => {
        // startReport(user?.username).then(() => {});
    };

    return (
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <Card
                sx={{
                    minWidth: 300,
                    maxWidth: 500,
                    padding: 2,
                    boxShadow: 3,
                }}
            >
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Iniciar nuevo reporte
                    </Typography>
                    <Typography variant="body2">
                        No hay un reporte activo. ¿Desea iniciar uno nuevo?
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button onClick={handleStartReport} color="primary">
                        Iniciar Reporte
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default NoReport;