import React, { useState, useCallback } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Typography,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Checkbox,
    FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { models } from "../../wailsjs/go/models";
import { to24HourFormat } from "../util/Helpers";

export interface RouteFormState {
    departure: string;
    destination: string;
    stops: models.Stop[];
    timetable: models.Time[];
    holiday_timetable: models.Time[];
}

const emptyStop = (): models.Stop => ({
    name: "",
    code: "",
    fare: 0,
    gold_fare: 0,
    is_main: false,
});

const emptyTime = (): models.Time => ({
    hour: 0,
    minute: 0,
});

function routeToFormState(route: models.Route | null): RouteFormState {
    if (!route) {
        return {
            departure: "",
            destination: "",
            stops: [],
            timetable: [],
            holiday_timetable: [],
        };
    }
    return {
        departure: route.departure || "",
        destination: route.destination || "",
        stops: (route.stops || []).map((s) => ({ ...s })),
        timetable: (route.timetable || []).map((t) => ({ ...t })),
        holiday_timetable: (route.holiday_timetable || []).map((t) => ({ ...t })),
    };
}

function formStateToRoute(state: RouteFormState, existingRoute: models.Route | null): models.Route {
    const route = new models.Route({
        departure: state.departure.trim(),
        destination: state.destination.trim(),
        stops: state.stops,
        timetable: state.timetable,
        holiday_timetable: state.holiday_timetable,
    });
    if (existingRoute && existingRoute.id) {
        route.id = existingRoute.id;
    }
    return route;
}

/** Returns true if the code at the given stop index is duplicated by another stop in the same route (case-insensitive, trimmed). */
function isStopCodeDuplicateInRoute(stops: models.Stop[], index: number): boolean {
    const code = (stops[index]?.code ?? "").trim().toLowerCase();
    if (!code) return false; // empty is handled separately
    return stops.some((s, i) => i !== index && (s.code ?? "").trim().toLowerCase() === code);
}

/** Returns a Set of stop codes (lowercase) used in the given routes. */
function getStopCodesFromRoutes(routes: models.Route[]): Set<string> {
    const set = new Set<string>();
    for (const r of routes) {
        for (const s of r.stops ?? []) {
            const code = (s.code ?? "").trim().toLowerCase();
            if (code) set.add(code);
        }
    }
    return set;
}

/** Returns true if the code at the given index is used by another route (not the one being edited). */
function isStopCodeUsedInOtherRoute(
    stops: models.Stop[],
    index: number,
    codesFromOtherRoutes: Set<string>
): boolean {
    const code = (stops[index]?.code ?? "").trim().toLowerCase();
    if (!code) return false;
    return codesFromOtherRoutes.has(code);
}

function getDuplicateCodes(stops: models.Stop[]): string[] {
    const seen = new Map<string, number>();
    const duplicates: string[] = [];
    for (const s of stops) {
        const code = (s.code ?? "").trim();
        if (!code) continue;
        const key = code.toLowerCase();
        const count = (seen.get(key) ?? 0) + 1;
        seen.set(key, count);
        if (count === 2) duplicates.push(code);
    }
    return [...new Set(duplicates)];
}

/** Compare route ids (both may be number[] from ObjectID). */
function sameRouteId(a: models.Route | null, b: models.Route | null): boolean {
    if (a == null || b == null) return a === b;
    const idA = a.id;
    const idB = b.id;
    if (idA == null || idB == null) return false;
    const arrA = Array.isArray(idA) ? idA : [idA];
    const arrB = Array.isArray(idB) ? idB : [idB];
    return arrA.length === arrB.length && arrA.every((v, i) => v === arrB[i]);
}

interface RouteFormDialogProps {
    open: boolean;
    route: models.Route | null;
    /** All existing routes (used to validate that stop codes are not used by another route). */
    allRoutes?: models.Route[];
    onClose: () => void;
    onSave: (route: models.Route) => Promise<void>;
}

export const RouteFormDialog: React.FC<RouteFormDialogProps> = ({ open, route, allRoutes = [], onClose, onSave }) => {
    const [state, setState] = useState<RouteFormState>(() => routeToFormState(route));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = route != null && route.id != null && (route.id as number[]).length > 0;

    // Stop codes from other routes (exclude current when editing) for cross-route validation
    const codesFromOtherRoutes = React.useMemo(() => {
        const other = (allRoutes ?? []).filter((r) => !sameRouteId(r, route));
        return getStopCodesFromRoutes(other);
    }, [allRoutes, route]);

    const getCodeError = useCallback(
        (index: number): string | undefined => {
            if (isStopCodeDuplicateInRoute(state.stops, index) && 
            isStopCodeUsedInOtherRoute(state.stops, index, codesFromOtherRoutes))
                return "Código ya usado";
            return undefined;
        },
        [state.stops, codesFromOtherRoutes]
    );

    React.useEffect(() => {
        if (open) {
            setState(routeToFormState(route));
            setError(null);
        }
    }, [open, route]);

    const update = useCallback(<K extends keyof RouteFormState>(key: K, value: RouteFormState[K]) => {
        setState((prev) => ({ ...prev, [key]: value }));
    }, []);

    const addStop = () => update("stops", [...state.stops, emptyStop()]);
    const removeStop = (index: number) =>
        update("stops", state.stops.filter((_, i) => i !== index));
    const changeStop = (index: number, field: keyof models.Stop, value: string | number | boolean) => {
        const next = state.stops.map((s, i) =>
            i === index ? { ...s, [field]: value } : s
        );
        update("stops", next);
    };

    const addTime = (which: "timetable" | "holiday_timetable") =>
        update(which, [...state[which], emptyTime()]);
    const removeTime = (which: "timetable" | "holiday_timetable", index: number) =>
        update(which, state[which].filter((_, i) => i !== index));
    const changeTime = (
        which: "timetable" | "holiday_timetable",
        index: number,
        field: "hour" | "minute",
        value: number
    ) => {
        const arr = state[which];
        const next = arr.map((t, i) =>
            i === index ? { ...t, [field]: value } : t
        );
        update(which, next);
    };

    const handleSave = async () => {
        setError(null);
        if (!state.departure.trim() || !state.destination.trim()) {
            setError("Salida y destino son requeridos.");
            return;
        }
        if (state.stops.length === 0) {
            setError("Debe haber al menos una parada.");
            return;
        }
        const duplicateCodes = getDuplicateCodes(state.stops);
        if (duplicateCodes.length > 0) {
            setError(`El código de parada no puede repetirse en la misma ruta: ${duplicateCodes.join(", ")}`);
            return;
        }
        const codesUsedElsewhere = state.stops
            .map((s) => (s.code ?? "").trim().toLowerCase())
            .filter((code) => code && codesFromOtherRoutes.has(code));
        if (codesUsedElsewhere.length > 0) {
            setError(`El código de parada ya está en uso en otra ruta: ${[...new Set(codesUsedElsewhere)].join(", ")}`);
            return;
        }
        const emptyCodeStop = state.stops.find((s, i) => !(s.code ?? "").trim());
        if (emptyCodeStop) {
            setError("Todas las paradas deben tener un código.");
            return;
        }
        if (state.timetable.length === 0) {
            setError("Debe haber al menos un horario en el timetable.");
            return;
        }
        if (state.holiday_timetable.length === 0) {
            setError("Debe haber al menos un horario en el holiday timetable.");
            return;
        }
        setSaving(true);
        try {
            const toSave = formStateToRoute(state, route);
            await onSave(toSave);
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al guardar");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>{isEdit ? "Editar ruta" : "Nueva ruta"}</DialogTitle>
            <DialogContent>
                {error && (
                    <Typography color="error" sx={{ mt: 1, mb: 1 }}>
                        {error}
                    </Typography>
                )}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <TextField
                            label="Salida"
                            value={state.departure}
                            onChange={(e) => update("departure", e.target.value)}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Destino"
                            value={state.destination}
                            onChange={(e) => update("destination", e.target.value)}
                            fullWidth
                            required
                        />
                    </Box>

                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Paradas ({state.stops.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nombre</TableCell>
                                            <TableCell>Código</TableCell>
                                            <TableCell align="right">Tarifa</TableCell>
                                            <TableCell align="right">Tarifa Gold</TableCell>
                                            <TableCell>Principal</TableCell>
                                            <TableCell width={50} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.stops.map((stop, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={stop.name}
                                                        onChange={(e) => changeStop(idx, "name", e.target.value)}
                                                        placeholder="Nombre"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        value={stop.code}
                                                        onChange={(e) => changeStop(idx, "code", e.target.value)}
                                                        placeholder="Código"
                                                        error={!!getCodeError(idx)}
                                                        helperText={getCodeError(idx)}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0 }}
                                                        value={stop.fare}
                                                        onChange={(e) => changeStop(idx, "fare", parseInt(e.target.value, 10) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0 }}
                                                        value={stop.gold_fare}
                                                        onChange={(e) => changeStop(idx, "gold_fare", parseInt(e.target.value, 10) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Checkbox
                                                        checked={stop.is_main}
                                                        onChange={(e) => changeStop(idx, "is_main", e.target.checked)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => removeStop(idx)}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button startIcon={<AddIcon />} onClick={addStop} sx={{ mt: 1 }}>
                                Añadir parada
                            </Button>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Horario regular ({state.timetable.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Hora</TableCell>
                                            <TableCell>Minuto</TableCell>
                                            <TableCell>Ver</TableCell>
                                            <TableCell width={50} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.timetable.map((t, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0, max: 23 }}
                                                        value={t.hour}
                                                        onChange={(e) => changeTime("timetable", idx, "hour", parseInt(e.target.value, 10) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0, max: 59 }}
                                                        value={t.minute}
                                                        onChange={(e) => changeTime("timetable", idx, "minute", parseInt(e.target.value, 10) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>{to24HourFormat(t)}</TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => removeTime("timetable", idx)}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button startIcon={<AddIcon />} onClick={() => addTime("timetable")} sx={{ mt: 1 }}>
                                Añadir horario
                            </Button>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion defaultExpanded>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Horario festivos ({state.holiday_timetable.length})</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Hora</TableCell>
                                            <TableCell>Minuto</TableCell>
                                            <TableCell>Ver</TableCell>
                                            <TableCell width={50} />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {state.holiday_timetable.map((t, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0, max: 23 }}
                                                        value={t.hour}
                                                        onChange={(e) => changeTime("holiday_timetable", idx, "hour", parseInt(e.target.value, 10) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <TextField
                                                        size="small"
                                                        type="number"
                                                        inputProps={{ min: 0, max: 59 }}
                                                        value={t.minute}
                                                        onChange={(e) => changeTime("holiday_timetable", idx, "minute", parseInt(e.target.value, 10) || 0)}
                                                    />
                                                </TableCell>
                                                <TableCell>{to24HourFormat(t)}</TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => removeTime("holiday_timetable", idx)}>
                                                        <DeleteOutlineIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <Button startIcon={<AddIcon />} onClick={() => addTime("holiday_timetable")} sx={{ mt: 1 }}>
                                Añadir horario
                            </Button>
                        </AccordionDetails>
                    </Accordion>
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
