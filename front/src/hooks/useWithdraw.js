import { useCallback, useEffect, useRef, useState } from "react";
import { createWithdraw, getTxStatus } from "@/lib/momo";

export function useWithdraw() {
    const [txId, setTxId] = useState(null);
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const timer = useRef(null);

    const startWithdraw = useCallback(async (payload) => {
        setError(null);
        setLoading(true);
        setStatus("PENDING");
        try {
            const { txId } = await createWithdraw(payload);
            setTxId(txId);
        } catch (e) {
            setError(e?.response?.data?.error || e.message || "Failed to create withdraw");
            setStatus(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!txId) return;
        const tick = async () => {
            try {
                const { status } = await getTxStatus(txId);
                setStatus(status);
                if (status === "PENDING") {
                    timer.current = window.setTimeout(tick, 1500);
                }
            } catch (error) {
                setError(error?.response?.data?.error || error.message || "Status error");
            }
        };
        tick();
        return () => {
            if (timer.current) window.clearTimeout(timer.current);
        };
    }, [txId]);

    return { txId, status, loading, error, startWithdraw };
}
