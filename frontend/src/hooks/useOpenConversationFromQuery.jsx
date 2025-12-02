// src/hooks/useOpenConversationFromQuery.js
import { useEffect, useRef } from 'react';

/**
 * useOpenConversationFromQuery(openConversation, ready)
 * - openConversation: function(conversationIdOrItem) -> Promise|void
 * - ready: boolean (when true, the hook will act)
 *
 * This uses a ref to avoid re-running because openConversation identity changed.
 * It also uses window.history.replaceState to remove query param without re-navigating.
 */
export default function useOpenConversationFromQuery(openConversation, ready = true) {
    const openRef = useRef(openConversation);

    // keep ref up-to-date without re-running the effect below
    useEffect(() => {
        openRef.current = openConversation;
    }, [openConversation]);

    useEffect(() => {
        if (!ready) return;

        const params = new URLSearchParams(window.location.search);
        const conversationId = params.get('conversationId');
        if (!conversationId) return;

        (async () => {
            try {
                // call the latest open function from the ref
                await openRef.current(conversationId);
            } catch (e) {
                console.error('Failed to open conversation from query:', e);
            }

            // remove the query param without causing react-router to remount/unmount routes
            params.delete('conversationId');
            const newSearch = params.toString();
            const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`;
            window.history.replaceState(null, '', newUrl);
        })();
        // Only depend on ready: we intentionally avoid depending on openConversation identity.
    }, [ready]);
}