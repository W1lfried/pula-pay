import { useCallback, useState } from "react";
import { getUserBalance } from "@/lib/momo";

export function useBalance() {
    const [balance, setBalance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const getBalance = useCallback( async (userId, currency) => {
        setError(null);
        setLoading(true);
        try {
            const { balance } = await getUserBalance(userId, currency);
            setBalance(Number(balance ?? 0));
        } catch (e) {
            setError(e?.response?.data?.error || e.message || "Failed to get balance");
        } finally {
            setLoading(false);
        }
    }, []);

    return { balance, loading, error, getBalance };
}