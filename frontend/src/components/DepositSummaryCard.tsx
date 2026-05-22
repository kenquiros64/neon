import React from 'react';
import { Alert, Box, Typography } from '@mui/material';
import { AccountBalanceWallet } from '@mui/icons-material';
import { models } from '../../wailsjs/go/models';
import { formatCurrency, getDepositAmount, getExpectedSalesTotal, getReportDeliveriesTotal } from '../util/reportHelpers';

interface DepositSummaryCardProps {
    report: models.Report;
    isPendingReport: boolean;
}

export const DepositSummaryCard: React.FC<DepositSummaryCardProps> = ({ report, isPendingReport }) => {
    const salesTotal = getExpectedSalesTotal(report);
    const delivered = getReportDeliveriesTotal(report);
    const pendingDeposit = isPendingReport ? getDepositAmount(report, 'total') : getDepositAmount(report, 'partial');

    return (
        <Alert
            severity="info"
            icon={<AccountBalanceWallet />}
            sx={{ mb: 2, borderRadius: 2 }}
        >
            <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Resumen para el vendedor
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                    <Typography variant="caption" color="text.secondary">Ventas registradas</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatCurrency(salesTotal)}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">Ya entregado</Typography>
                    <Typography variant="body1" fontWeight={600}>{formatCurrency(delivered)}</Typography>
                </Box>
                <Box>
                    <Typography variant="caption" color="text.secondary">
                        {isPendingReport ? 'Pendiente al cierre total' : 'Al cierre parcial'}
                    </Typography>
                    <Typography variant="body1" fontWeight={700} color="primary.main">
                        {formatCurrency(pendingDeposit)}
                    </Typography>
                </Box>
            </Box>
        </Alert>
    );
};
