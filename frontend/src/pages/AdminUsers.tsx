import React, { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
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
import PeopleIcon from "@mui/icons-material/People";
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
        <Box sx={{ p: 3, mx: "auto" }}>
            <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Typography variant="h4" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <PeopleIcon color="primary" />
                    Administrar usuarios
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<SyncIcon />}
                        onClick={handleSync}
                        disabled={syncing}
                    >
                        {syncing ? "Sincronizando…" : "Sincronizar"}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                        Nuevo usuario
                    </Button>
                </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 2 }}>
                Los usuarios se guardan remotamente y luego se sincronizan al almacenamiento local.
            </Alert>

            <Card>
                <CardContent>
                    {users.length === 0 ? (
                        <Typography color="text.secondary">
                            No hay usuarios. Sincronice o cree un nuevo usuario.
                        </Typography>
                    ) : (
                        <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Usuario</TableCell>
                                        <TableCell>Nombre</TableCell>
                                        <TableCell>Rol</TableCell>
                                        <TableCell>Creado</TableCell>
                                        <TableCell align="right">Acciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {users.map((u) => (
                                        <TableRow key={u.username}>
                                            <TableCell>
                                                <Typography fontWeight={500}>{u.username}</Typography>
                                            </TableCell>
                                            <TableCell>{u.name}</TableCell>
                                            <TableCell>{u.role}</TableCell>
                                            <TableCell>{u.created_at ? new Date(u.created_at).toLocaleDateString("es-CR") : "—"}</TableCell>
                                            <TableCell align="right">
                                                <IconButton size="small" onClick={() => handleEdit(u)} title="Editar">
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDeleteClick(u)} title="Eliminar">
                                                    <DeleteOutlineIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CardContent>
            </Card>

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
        </Box>
    );
};

export default AdminUsers;
