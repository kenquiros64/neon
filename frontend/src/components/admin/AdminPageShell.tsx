import React from 'react';
import { Box } from '@mui/material';
import { DashboardPageHeader } from '../dashboard/DashboardPageHeader';
import { dashboardPageSx } from '../../theme/dashboardTheme';

interface AdminPageShellProps {
    title: string;
    subtitle?: string;
    breadcrumb?: string;
    action?: React.ReactNode;
    children: React.ReactNode;
}

export const AdminPageShell: React.FC<AdminPageShellProps> = ({
    title,
    subtitle,
    breadcrumb = 'Administración',
    action,
    children,
}) => (
    <Box sx={dashboardPageSx}>
        <DashboardPageHeader
            title={title}
            subtitle={subtitle}
            breadcrumb={breadcrumb}
            action={action}
        />
        {children}
    </Box>
);
