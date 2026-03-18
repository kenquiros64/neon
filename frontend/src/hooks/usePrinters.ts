import { useState, useCallback, useEffect } from 'react';
import { GetInstalledPrinters, GetPrinterStatus } from '../../wailsjs/go/services/PrintService';

export interface PrinterState {
    printers: string[];
    defaultPrinter: string;
    status: 'ready' | 'error' | 'loading' | 'unknown';
    statusMessage: string;
}

export function usePrinters(): PrinterState & { refresh: () => Promise<void> } {
    const [printers, setPrinters] = useState<string[]>([]);
    const [defaultPrinter, setDefaultPrinter] = useState('');
    const [status, setStatus] = useState<'ready' | 'error' | 'loading' | 'unknown'>('unknown');
    const [statusMessage, setStatusMessage] = useState('');

    const refresh = useCallback(async () => {
        setStatus('loading');
        setStatusMessage('');
        try {
            const list = await GetInstalledPrinters();
            setPrinters(list || []);
            const first = list && list.length > 0 ? list[0] : '';
            setDefaultPrinter(first);
            if (!first) {
                setStatus('unknown');
                setStatusMessage('No hay impresora configurada');
                return;
            }
            const st = await GetPrinterStatus(first);
            setStatus(st === 'ready' ? 'ready' : 'unknown');
            setStatusMessage(st === 'ready' ? 'Lista' : st);
        } catch (e: any) {
            setStatus('error');
            setStatusMessage(e?.message || 'Error al conectar con la impresora');
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return {
        printers,
        defaultPrinter,
        status,
        statusMessage,
        refresh,
    };
}
