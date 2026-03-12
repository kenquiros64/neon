import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    MenuItem,
} from "@mui/material";
import { models } from "../../wailsjs/go/models";

interface UserFormDialogProps {
    open: boolean;
    user: models.User | null;
    onClose: () => void;
    onSave: (user: models.User) => Promise<void>;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({ open, user, onClose, onSave }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("user");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!user?.username;

    useEffect(() => {
        if (open) {
            setUsername(user?.username ?? "");
            setPassword("");
            setName(user?.name ?? "");
            setRole(user?.role ?? "user");
            setError(null);
        }
    }, [open, user]);

    const handleSave = async () => {
        setError(null);
        if (!username.trim()) {
            setError("Usuario es requerido.");
            return;
        }
        if (!name.trim()) {
            setError("Nombre es requerido.");
            return;
        }
        if (!isEdit && !password.trim()) {
            setError("Contraseña es requerida para nuevo usuario.");
            return;
        }
        setSaving(true);
        try {
            const toSave = new models.User({
                username: username.trim(),
                password: password.trim() || (user?.password ?? ""),
                name: name.trim(),
                role: role || "user",
                created_at: user?.created_at ?? "",
                updated_at: user?.updated_at,
            });
            await onSave(toSave);
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEdit ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
            <DialogContent>
                {error && (
                    <Typography color="error" sx={{ mt: 1, mb: 1 }}>
                        {error}
                    </Typography>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <TextField
                        label="Usuario"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={isEdit}
                        helperText={isEdit ? "No se puede cambiar el usuario" : undefined}
                    />
                    <TextField
                        label={isEdit ? "Nueva contraseña (dejar en blanco para mantener)" : "Contraseña"}
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required={!isEdit}
                    />
                    <TextField
                        label="Nombre"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <TextField
                        select
                        label="Rol"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <MenuItem value="user">Usuario</MenuItem>
                        <MenuItem value="admin">Administrador</MenuItem>
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? "Guardando…" : "Guardar"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
