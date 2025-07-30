import { useEffect } from 'react';

interface UseKeyboardShortcutsProps {
    hasPendingReportFromOtherUser: boolean;
    showPurchaseDialog: boolean;
    inputRef: React.RefObject<HTMLInputElement>;
    onRegularTicket: () => void;
    onGoldTicket: () => void;
}

export const useKeyboardShortcuts = ({
    hasPendingReportFromOtherUser,
    showPurchaseDialog,
    inputRef,
    onRegularTicket,
    onGoldTicket
}: UseKeyboardShortcutsProps) => {
    useEffect(() => {
        const handleGlobalKeyDown = (e: KeyboardEvent) => {
            // Don't trigger if there's a pending report from another user
            if (hasPendingReportFromOtherUser) return;
            
            // Don't trigger if a dialog is open
            if (showPurchaseDialog) return;
            
            // Don't trigger if user is typing in an input field (except our code input)
            const target = e.target as HTMLElement;
            if (target.tagName === 'INPUT' && target !== inputRef.current) return;
            if (target.tagName === 'TEXTAREA') return;
            
            if (e.key === ' ') {
                e.preventDefault(); // Prevent space from scrolling the page
                onRegularTicket();
            } else if (e.key === 'Enter') {
                e.preventDefault(); // Prevent any default behavior
                onGoldTicket();
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown);

        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown);
        };
    }, [hasPendingReportFromOtherUser, showPurchaseDialog, inputRef, onRegularTicket, onGoldTicket]);
}; 