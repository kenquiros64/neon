import React from "react";
import { Box, Typography, Grid, Card, CardContent } from "@mui/material";
import { Receipt, AttachMoney, Warning } from "@mui/icons-material";
import { models } from "../../wailsjs/go/models";

interface ReportStatsCardsProps {
    report: models.Report;
    isPendingReport: boolean;
}

interface StatCardProps {
    icon: React.ReactNode;
    value: string;
    label: string;
    accentColor: string;
    textColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, accentColor, textColor }) => (
    <Card variant="outlined" sx={{ borderTop: `3px solid`, borderTopColor: accentColor, borderRadius: 2 }}>
        <CardContent sx={{ textAlign: 'center', p: 2, '&:last-child': { pb: 2 } }}>
            <Box sx={{ color: accentColor, mb: 0.5 }}>{icon}</Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: textColor }}>
                {value}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                {label}
            </Typography>
        </CardContent>
    </Card>
);

const ReportStatsCards: React.FC<ReportStatsCardsProps> = ({ report, isPendingReport }) => {
    const formatCurrency = (amount: number) => `₡${amount.toLocaleString()}`;

    return (
        <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                    icon={<Receipt sx={{ fontSize: 28 }} />}
                    value={String(report.partial_tickets + report.final_tickets)}
                    label="Tiquetes Vendidos"
                    accentColor="info.main"
                    textColor="info.dark"
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                    icon={<AttachMoney sx={{ fontSize: 28 }} />}
                    value={formatCurrency(report.partial_cash + report.final_cash)}
                    label="Total Generado"
                    accentColor="success.main"
                    textColor="success.dark"
                />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                    icon={<Receipt sx={{ fontSize: 28 }} />}
                    value={formatCurrency(report.total_null)}
                    label="Anulados"
                    accentColor="error.main"
                    textColor="error.dark"
                />
            </Grid>
            {isPendingReport && (
                <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                        icon={<Warning sx={{ fontSize: 28 }} />}
                        value={formatCurrency(report.final_cash)}
                        label="Efectivo Pendiente"
                        accentColor="warning.main"
                        textColor="warning.dark"
                    />
                </Grid>
            )}
        </Grid>
    );
};

export default ReportStatsCards;
