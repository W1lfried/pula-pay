import { useCallback, useState } from "react";
import { login } from "@/lib/auth";

export function useLogin() {
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const startLogin = useCallback( async (payload) => {
        setError(null);
        setLoading(true);
        try {
            const { token } = await login(payload);
            setToken(token);
        } catch (e) {
            setError(e?.response?.data?.error || e.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    }, []);

    return { token, loading, error, startLogin };
}