import React, {useEffect, useState} from "react";
import {Box, Button, Card, CardActions, CardContent, Typography} from "@mui/material";
// import {useReportState} from "../states/ReportState";
import {useRoutesState} from "../states/RoutesState";
import {useAuthState} from "../states/AuthState";

const Reports: React.FC = () => {
    // const {report, startReport, checkReportStatus} = useReportState();
    const {fetchRoutes} = useRoutesState();
    const [isReportActive, setIsReportActive] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const {user} = useAuthState();

    const handleStartReport = async () => {
        // startReport(user?.username).then(() => {});
    };

    // useEffect(() => {
    //     checkReportStatus(user?.username).then((r) => {
    //         if (!r) {
    //             setIsReportActive(false);
    //         } else {
    //             fetchRoutes();
    //             setIsReportActive(true);
    //         }
    //     }).catch((error) => {
    //         console.error("CHECK REPORT STATUS ERROR", error);
    //     });
    // }, [checkReportStatus]);

    // useEffect(() => {
    //     setIsLoading(false);
    //     if (!report) {
    //         return;
    //     }
    //     console.log("Report", report);
    //     setIsReportActive(true);
    // }, [report]);

    return isLoading
        ? null
        : isReportActive ?
        <Box p={3}>
            <Typography variant="h4" gutterBottom>
                Reporte
            </Typography>
            {/* <Typography variant="body1"><strong>ID:</strong> {report?.id ?? "N/A"}</Typography>
            <Typography variant="body1"><strong>Username:</strong> {report?.username}</Typography>
            <Typography variant="body1">
                <strong>Fecha de creación:</strong> {report?.createdAt ? new Date(report.createdAt).toISOString() : "N/A"}
            </Typography> */}
            {/*<Typography variant="body1">*/}
            {/*      <strong>Cierre Parcial:</strong>{" "}*/}
            {/*      {report?.partialClosedAt ? report.partialClosedAt.toISOString() : "N/A"}*/}
            {/*</Typography>*/}
        </Box> :
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
};

export default Reports;