import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';

interface DashboardPageHeaderProps {
    title: string;
    subtitle?: string;
    breadcrumb?: string;
    action?: React.ReactNode;
}

export const DashboardPageHeader: React.FC<DashboardPageHeaderProps> = ({
    title,
    subtitle,
    breadcrumb,
    action,
}) => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3, gap: 2, flexWrap: 'wrap' }}>
        <Box>
            {breadcrumb && (
                <Breadcrumbs sx={{ mb: 0.5 }} aria-label="breadcrumb">
                    <Link underline="hover" color="text.secondary" variant="body2" sx={{ cursor: 'default' }}>
                        {breadcrumb}
                    </Link>
                    <Typography variant="body2" color="text.primary" fontWeight={600}>
                        {title}
                    </Typography>
                </Breadcrumbs>
            )}
            <Typography variant="h4" fontWeight={700}>
                {title}
            </Typography>
            {subtitle && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {subtitle}
                </Typography>
            )}
        </Box>
        {action}
    </Box>
);
