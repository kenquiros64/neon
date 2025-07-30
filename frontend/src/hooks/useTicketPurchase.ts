import { useState } from 'react';
import { toast } from 'react-toastify';
import { models } from '../../wailsjs/go/models';
import { AddTicket } from '../../wailsjs/go/services/TicketService';
import { to24HourFormat } from '../util/Helpers';

interface UseTicketPurchaseProps {
    selectedRoute: any;
    selectedStopID: String | null;
    selectedTime: models.Time;
    user: any;
    report: any;
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

    const handlePurchaseConfirm = async (quantity: number, idNumber?: string) => {
        try {
            const currentSelectedStop = selectedRoute.stops.find((stop: any) => stop.code === selectedStopID);
            
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

            // Save tickets to database
            await AddTicket(ticketsToAdd);
            
            // Only increment counts if database save was successful
            incrementCount(quantity, purchaseTicketType);
            
            // Show success message
            toast.success(`${quantity} tiquete${quantity > 1 ? 's' : ''} guardado${quantity > 1 ? 's' : ''} exitosamente`);
            
            setShowPurchaseDialog(false);
            
        } catch (error) {
            console.error("Error saving tickets:", error);
            toast.error("Error al guardar los tickets. No se modificaron los conteos.");
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