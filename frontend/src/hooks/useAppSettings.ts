import { useCallback, useEffect, useState } from 'react';
import { GetAppSettings, SaveAppSettings } from '../../wailsjs/go/services/SettingsService';
import { models } from '../../wailsjs/go/models';

export function useAppSettings() {
    const [settings, setSettings] = useState<models.AppSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        setLoading(true);
        try {
            const s = await GetAppSettings();
            setSettings(s);
        } catch (e) {
            console.error(e);
            setSettings(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const save = useCallback(async (next: models.AppSettings) => {
        const saved = await SaveAppSettings(next);
        setSettings(saved);
        return saved;
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { settings, loading, refresh, save };
}
