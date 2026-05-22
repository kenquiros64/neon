import React from 'react';
import { Box, Typography, alpha, useTheme } from '@mui/material';

export type StatAccent = 'primary' | 'success' | 'secondary' | 'warning' | 'info';

interface DashboardStatCardProps {
    label: string;
    value: string;
    subtext?: string;
    icon: React.ReactNode;
    accent?: StatAccent;
}

export const DashboardStatCard: React.FC<DashboardStatCardProps> = ({
    label,
    value,
    subtext,
    icon,
    accent = 'primary',
}) => {
    const theme = useTheme();
    const paletteColor = theme.palette[accent];
    const mainColor =
        paletteColor && typeof paletteColor === 'object' && 'main' in paletteColor
            ? (paletteColor as { main: string }).main
            : theme.palette.primary.main;

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 2,
                height: '100%',
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(mainColor, 0.12),
                    color: mainColor,
                    flexShrink: 0,
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    {label}
                </Typography>
                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.2, mt: 0.25 }}>
                    {value}
                </Typography>
                {subtext && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {subtext}
                    </Typography>
                )}
            </Box>
        </Box>
    );
};
