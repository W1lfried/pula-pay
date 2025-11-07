import { useCallback, useState } from "react";
import { verifyPhone } from "@/lib/auth";

export function useVerify() {
    const [phoneVerified, setPhoneVerified] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startVerify = useCallback( async (payload) => {
        setError(null);
        setLoading(true);
        setPhoneVerified(false);
        try {
            const { verified } = await verifyPhone(payload);
            setPhoneVerified(verified);
        } catch (e) {
            setError(e?.response?.data?.error || e.message || "Failed to verify");
        } finally {
            setLoading(false);
        }
    }, []);

    return { phoneVerified, loading, error, startVerify };
}