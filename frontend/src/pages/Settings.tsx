import React, { useEffect, useState } from 'react';
import {
    Box,
    TextField,
    Button,
    CircularProgress,
    Typography,
} from '@mui/material';
import { Save, Print } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { models } from '../../wailsjs/go/models';
import { useAppSettings } from '../hooks/useAppSettings';
import { AdminPageShell } from '../components/admin/AdminPageShell';
import { dashboardPanelSx } from '../theme/dashboardTheme';

const Settings: React.FC = () => {
    const { settings, loading, save } = useAppSettings();
    const [form, setForm] = useState<models.AppSettings | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setForm(new models.AppSettings({ ...settings }));
        }
    }, [settings]);

    const update = (patch: Partial<models.AppSettings>) => {
        if (!form) return;
        setForm(new models.AppSettings({ ...form, ...patch }));
    };

    const handleSave = async () => {
        if (!form) return;
        setSaving(true);
        try {
            await save(form);
            toast.success('Configuración de impresión guardada');
        } catch (e: any) {
            toast.error(e?.message || 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading || !form) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <AdminPageShell
            title="Impresión de tiquetes"
            subtitle="Textos del encabezado y pie que se imprimen en cada tiquete"
            breadcrumb="Configuración"
            action={
                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving ? 'Guardando…' : 'Guardar'}
                </Button>
            }
        >
            <Box sx={{ ...dashboardPanelSx, p: 3, maxWidth: 560 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Print color="primary" />
                    Encabezado y pie
                </Typography>
                <TextField
                    fullWidth
                    label="Línea 1"
                    value={form.print_header_line1}
                    onChange={(e) => update({ print_header_line1: e.target.value })}
                    sx={{ mb: 2, mt: 2 }}
                />
                <TextField
                    fullWidth
                    label="Línea 2"
                    value={form.print_header_line2}
                    onChange={(e) => update({ print_header_line2: e.target.value })}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Teléfono"
                    value={form.print_header_phone}
                    onChange={(e) => update({ print_header_phone: e.target.value })}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Pie del tiquete"
                    value={form.print_footer}
                    onChange={(e) => update({ print_footer: e.target.value })}
                    helperText="Ej: BUEN VIAJE"
                />
            </Box>
        </AdminPageShell>
    );
};

export default Settings;
