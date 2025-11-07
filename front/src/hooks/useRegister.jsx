import { useCallback, useState } from "react";
import { register } from "@/lib/auth";

export function useRegister() {
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startRegister = useCallback( async (payload) => {
        setError(null);
        setLoading(true);
        try {
            const { userId } = await register(payload);
            setUserId(userId);
        } catch (e) {
            setError(e?.response?.data?.error || e.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    }, []);

    return { userId, loading, error, startRegister };
}