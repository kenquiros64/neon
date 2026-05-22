import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SyncIcon from "@mui/icons-material/Sync";
import Tooltip from "@mui/material/Tooltip";
import { AdminPageShell } from "../components/admin/AdminPageShell";
import { dashboardPanelSx } from "../theme/dashboardTheme";
import { models } from "../../wailsjs/go/models";
import { AddRoute, UpdateRoute, DeleteRoute } from "../../wailsjs/go/services/RouteService";
import { SyncRoutes } from "../../wailsjs/go/services/SyncService";
import { useRoutesState } from "../states/RoutesState";
import { fullRouteName } from "../util/Helpers";
import { RouteFormDialog } from "../components/RouteFormDialog";
import { toast } from "react-toastify";

const AdminRoutes: React.FC = () => {
    const { routes, routesLoading, fetchRoutes } = useRoutesState();
    const [syncing, setSyncing] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<models.Route | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<models.Route | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchRoutes();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await SyncRoutes();
            await fetchRoutes();
            toast.success("Rutas sincronizadas");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Error al sincronizar");
        } finally {
            setSyncing(false);
        }
    };

    const handleAdd = () => {
        setEditingRoute(null);
        setFormOpen(true);
    };

    const handleEdit = (route: models.Route) => {
        setEditingRoute(route);
        setFormOpen(true);
    };

    const handleSaveRoute = async (route: models.Route) => {
        setActionLoading(true);
        try {
            const isEdit = route.id && (route.id as number[]).length > 0;
            if (isEdit) {
                await UpdateRoute(route);
                toast.success("Ruta actualizada");
            } else {
                await AddRoute(route);
                toast.success("Ruta creada");
            }
            await fetchRoutes();
            setFormOpen(false);
        } catch (e: unknown) {
            throw e;
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = (route: models.Route) => setDeleteConfirm(route);
    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        setActionLoading(true);
        try {
            await DeleteRoute(deleteConfirm);
            toast.success("Ruta eliminada");
            await fetchRoutes();
            setDeleteConfirm(null);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Error al eliminar");
        } finally {
            setActionLoading(false);
        }
    };

    if (routesLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AdminPageShell
            title="Rutas"
            subtitle="Paradas, tarifas y horarios sincronizados con el servidor"
            action={
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<SyncIcon />} onClick={handleSync} disabled={syncing}>
                        {syncing ? "Sincronizando…" : "Sincronizar"}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                        Nueva ruta
                    </Button>
                </Box>
            }
        >
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Las rutas se guardan remotamente y luego se sincronizan al almacenamiento local.
            </Alert>

            <Box sx={{ ...dashboardPanelSx, p: 0 }}>
                {routes.length === 0 ? (
                    <Box sx={{ p: 3 }}>No hay rutas. Sincronice o cree una nueva ruta.</Box>
                ) : (
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 700, bgcolor: 'background.default' } }}>
                                    <TableCell>Ruta</TableCell>
                                    <TableCell>Paradas</TableCell>
                                    <TableCell>Horarios reg.</TableCell>
                                    <TableCell>Horarios fest.</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {routes.map((route) => (
                                    <TableRow key={fullRouteName(route)} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{fullRouteName(route)}</TableCell>
                                        <TableCell>{route.stops?.length ?? 0}</TableCell>
                                        <TableCell>{route.timetable?.length ?? 0}</TableCell>
                                        <TableCell>{route.holiday_timetable?.length ?? 0}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Editar">
                                                <IconButton size="small" onClick={() => handleEdit(route)}><EditIcon /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(route)}><DeleteOutlineIcon /></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <RouteFormDialog
                open={formOpen}
                route={editingRoute}
                allRoutes={routes}
                onClose={() => setFormOpen(false)}
                onSave={handleSaveRoute}
            />

            <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                <DialogTitle>Eliminar ruta</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Eliminar la ruta {deleteConfirm ? fullRouteName(deleteConfirm) : ""}? Esta acción no se puede deshacer.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
                    <Button color="error" variant="contained" onClick={handleDeleteConfirm} disabled={actionLoading}>
                        {actionLoading ? "Eliminando…" : "Eliminar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </AdminPageShell>
    );
};

export default AdminRoutes;
