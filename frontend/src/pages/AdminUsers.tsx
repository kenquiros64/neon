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
import { GetUsers, AddUser, UpdateUser, DeleteUser } from "../../wailsjs/go/services/UserService";
import { SyncUsers } from "../../wailsjs/go/services/SyncService";
import { UserFormDialog } from "../components/UserFormDialog";
import { toast } from "react-toastify";

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<models.User[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<models.User | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<models.User | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const list = await GetUsers();
            setUsers(list ?? []);
        } catch (e) {
            console.error(e);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleSync = async () => {
        setSyncing(true);
        try {
            await SyncUsers();
            await fetchUsers();
            toast.success("Usuarios sincronizados");
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Error al sincronizar");
        } finally {
            setSyncing(false);
        }
    };

    const handleAdd = () => {
        setEditingUser(null);
        setFormOpen(true);
    };

    const handleEdit = (user: models.User) => {
        setEditingUser(user);
        setFormOpen(true);
    };

    const handleSaveUser = async (user: models.User) => {
        setActionLoading(true);
        try {
            const isEdit = !!editingUser?.username;
            if (isEdit) {
                await UpdateUser(user);
                toast.success("Usuario actualizado");
            } else {
                await AddUser(user);
                toast.success("Usuario creado");
            }
            await fetchUsers();
            setFormOpen(false);
        } catch (e: unknown) {
            throw e;
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteClick = (user: models.User) => setDeleteConfirm(user);
    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        setActionLoading(true);
        try {
            await DeleteUser(deleteConfirm);
            toast.success("Usuario eliminado");
            await fetchUsers();
            setDeleteConfirm(null);
        } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Error al eliminar");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AdminPageShell
            title="Usuarios"
            subtitle="Crear, editar y sincronizar cuentas de cajeros"
            action={
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<SyncIcon />} onClick={handleSync} disabled={syncing}>
                        {syncing ? "Sincronizando…" : "Sincronizar"}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                        Nuevo usuario
                    </Button>
                </Box>
            }
        >
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
                Los usuarios se guardan remotamente y luego se sincronizan al almacenamiento local.
            </Alert>

            <Box sx={{ ...dashboardPanelSx, p: 0 }}>
                {users.length === 0 ? (
                    <Box sx={{ p: 3 }}>No hay usuarios. Sincronice o cree un nuevo usuario.</Box>
                ) : (
                    <TableContainer component={Paper} elevation={0}>
                        <Table size="small">
                            <TableHead>
                                <TableRow sx={{ '& .MuiTableCell-head': { fontWeight: 700, bgcolor: 'background.default' } }}>
                                    <TableCell>Usuario</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Rol</TableCell>
                                    <TableCell>Creado</TableCell>
                                    <TableCell align="right">Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.username} hover>
                                        <TableCell sx={{ fontWeight: 600 }}>{u.username}</TableCell>
                                        <TableCell>{u.name}</TableCell>
                                        <TableCell>{u.role}</TableCell>
                                        <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString("es-CR") : "—"}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Editar">
                                                <IconButton size="small" onClick={() => handleEdit(u)}><EditIcon /></IconButton>
                                            </Tooltip>
                                            <Tooltip title="Eliminar">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(u)}><DeleteOutlineIcon /></IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <UserFormDialog
                open={formOpen}
                user={editingUser}
                onClose={() => setFormOpen(false)}
                onSave={handleSaveUser}
            />

            <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
                <DialogTitle>Eliminar usuario</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        ¿Eliminar al usuario {deleteConfirm?.username} ({deleteConfirm?.name})? Esta acción no se puede deshacer.
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

export default AdminUsers;
