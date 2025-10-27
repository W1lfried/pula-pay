import { useCallback, useState } from "react";
import { getRecipientId } from "@/lib/momo";

export function useRecipientId() {
    const [recipientId, setRecipientId] = useState(null);
    const [error, setError] = useState(null);

    const getPhoneUserId = useCallback( async (senderId, phone) => {
        setError(null);
        try {
            const { userId } = await getRecipientId(senderId, phone);
            setRecipientId(userId);
        } catch (e) {
            setError(e?.response?.data?.error || e.message || "Failed to get user");
        }
    }, []);

    return { recipientId, error, getPhoneUserId };
}