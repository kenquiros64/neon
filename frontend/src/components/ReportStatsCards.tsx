import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import { Receipt, AttachMoney, Warning } from "@mui/icons-material";
import { models } from "../../wailsjs/go/models";

interface ReportStatsCardsProps {
    report: models.Report;
    isPendingReport: boolean;
}

const ReportStatsCards: React.FC<ReportStatsCardsProps> = ({ report, isPendingReport }) => {
    const formatCurrency = (amount: number) => {
        return `₡${amount.toLocaleString()}`;
    };

    return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'info.dark', borderRadius: 2 }}>
                    <Receipt sx={{ fontSize: 32, color: 'info.contrastText', mb: 1 }} />
                    <Typography variant="h6" color="info.contrastText">
                        {report.total_tickets}
                    </Typography>
                    <Typography variant="body2" color="info.contrastText">
                        Tiquetes Vendidos
                    </Typography>
                </Box>
            </Grid>
            
            <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'success.light', borderRadius: 2 }}>
                    <AttachMoney sx={{ fontSize: 32, color: 'success.contrastText', mb: 1 }} />
                    <Typography variant="h6" color="success.contrastText">
                        {formatCurrency(report.total_cash)}
                    </Typography>
                    <Typography variant="body2" color="success.contrastText">
                        Total Generado
                    </Typography>
                </Box>
            </Grid>
            
            <Grid size={{ xs: 6, sm: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'error.light', borderRadius: 2 }}>
                    <Receipt sx={{ fontSize: 32, color: 'primary.contrastText', mb: 1 }} />
                    <Typography variant="h6" color="primary.contrastText">
                        {formatCurrency(report.total_null)}
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                        Anulados
                    </Typography>
                </Box>
            </Grid>
            
            {isPendingReport && (
                <Grid size={{ xs: 6, sm: 3 }}>
                    <Box sx={{ textAlign: 'center', p: 2, backgroundColor: 'warning.light', borderRadius: 2 }}>
                        <Warning sx={{ fontSize: 32, color: 'warning.contrastText', mb: 1 }} />
                        <Typography variant="h6" color="warning.contrastText">
                            {formatCurrency(report.partial_cash)}
                        </Typography>
                        <Typography variant="body2" color="warning.contrastText">
                            Efectivo Pendiente
                        </Typography>
                    </Box>
                </Grid>
            )}
        </Grid>
    );
};

export default ReportStatsCards; 