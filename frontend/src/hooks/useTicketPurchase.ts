import { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { models } from '../../wailsjs/go/models';
import { AddTicketWithPrint } from '../../wailsjs/go/services/TicketService';
import { GetInstalledPrinters } from '../../wailsjs/go/services/PrintService';
import { to24HourFormat } from '../util/Helpers';

interface UseTicketPurchaseProps {
    selectedRoute: models.Route;
    selectedStopID: String | null;
    selectedTime: models.Time;
    user: models.User | null;
    report: models.Report | null;
    incrementCount: (quantity: number, ticketType: 'regular' | 'gold') => void;
    focusInput: () => void;
}

export const useTicketPurchase = ({
    selectedRoute,
    selectedStopID,
    selectedTime,
    user,
    report,
    incrementCount,
    focusInput
}: UseTicketPurchaseProps) => {
    const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
    const [purchaseTicketType, setPurchaseTicketType] = useState<'regular' | 'gold'>('regular');

    const getDefaultPrinter = useCallback(async (): Promise<string> => {
        try {
            const printers = await GetInstalledPrinters();
            return printers && printers.length > 0 ? printers[0] : '';
        } catch {
            return '';
        }
    }, []);

    const handlePurchaseConfirm = async (quantity: number, idNumber?: string) => {
        try {
            const currentSelectedStop = selectedRoute.stops.find((stop: models.Stop) => stop.code === selectedStopID);
            
            if (!currentSelectedStop || !selectedRoute || !selectedTime || !user) {
                toast.error("Faltan datos para crear el ticket");
                return;
            }

            // Create ticket objects based on quantity
            const ticketsToAdd: models.Ticket[] = [];
            for (let i = 0; i < quantity; i++) {
                const ticket = new models.Ticket({
                    id: 0, // Will be set by database
                    departure: selectedRoute.departure,
                    destination: selectedRoute.destination,
                    username: user.username,
                    stop: currentSelectedStop.name,
                    time: to24HourFormat(selectedTime),
                    fare: purchaseTicketType === 'gold' ? currentSelectedStop.gold_fare : currentSelectedStop.fare,
                    id_number: idNumber || "",
                    is_gold: purchaseTicketType === 'gold',
                    is_null: false,
                    report_id: report?.id || 0,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
                ticketsToAdd.push(ticket);
            }

            const printerName = await getDefaultPrinter();
            if (!printerName) {
                toast.error("No hay impresora ethernet configurada. Configure PRINTER_ADDRESS o PRINTER_DEVICE.");
                return;
            }

            // Save tickets and print; if print fails, backend rolls back (no tickets saved)
            await AddTicketWithPrint(ticketsToAdd, printerName);
            
            // Only increment counts if database save (and print) was successful
            incrementCount(quantity, purchaseTicketType);
            
            toast.success(
                printerName
                    ? `${quantity} tiquete${quantity > 1 ? 's' : ''} guardado${quantity > 1 ? 's' : ''} e impreso${quantity > 1 ? 's' : ''} exitosamente`
                    : `${quantity} tiquete${quantity > 1 ? 's' : ''} guardado${quantity > 1 ? 's' : ''} exitosamente`
            );
            
            setShowPurchaseDialog(false);
            
        } catch (error: any) {
            console.error("Error saving/printing tickets:", error);
            const msg = error?.message || String(error);
            const isPrintError = /printer|print|paper|offline|disconnect|cover|cutter/i.test(msg);
            toast.error(
                isPrintError
                    ? "Error al imprimir. No se guardaron los tickets. Verifique la impresora (papel, conexión) e intente de nuevo."
                    : "Error al guardar los tickets. No se modificaron los conteos."
            );
            // Don't close dialog or increment counts on error
        }
    };

    const handlePurchaseCancel = () => {
        setShowPurchaseDialog(false);
        // Refocus the input after dialog closes
        setTimeout(() => {
            focusInput();
        }, 100);
    };

    const showRegularTicketDialog = () => {
        setPurchaseTicketType('regular');
        setShowPurchaseDialog(true);
    };

    const showGoldTicketDialog = () => {
        setPurchaseTicketType('gold');
        setShowPurchaseDialog(true);
    };

    const handleShowDialogFromHomeCard = (ticketType: 'regular' | 'gold') => {
        setPurchaseTicketType(ticketType);
        setShowPurchaseDialog(true);
    };

    return {
        showPurchaseDialog,
        purchaseTicketType,
        handlePurchaseConfirm,
        handlePurchaseCancel,
        showRegularTicketDialog,
        showGoldTicketDialog,
        handleShowDialogFromHomeCard
    };
}; 