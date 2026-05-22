/** Shared dashboard surface styles (reports / ventas / admin) */
export const dashboardPanelSx = {
    borderRadius: 3,
    border: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.paper',
    overflow: 'hidden',
} as const;

export const dashboardPageSx = {
    flex: 1,
    minHeight: 0,
    p: { xs: 2, md: 3 },
    bgcolor: 'background.default',
} as const;
