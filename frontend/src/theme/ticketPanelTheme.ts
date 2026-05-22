/** Accent palette for route number badges (cycles by list index) */
export const ROUTE_BADGE_COLORS = [
    '#2196F3',
    '#4CAF50',
    '#9C27B0',
    '#FF9800',
    '#E91E63',
    '#00BCD4',
    '#8BC34A',
    '#FF5722',
] as const;

export const routeBadgeColor = (index: number) =>
    ROUTE_BADGE_COLORS[index % ROUTE_BADGE_COLORS.length];
