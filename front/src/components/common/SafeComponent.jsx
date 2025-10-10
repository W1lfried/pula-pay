import React, { Suspense } from 'react';
import ErrorBoundary from './ErrorBoundary';
import LoadingSpinner from './LoadingSpinner';

// Wrapper universel pour sécuriser n'importe quel composant
export default function SafeComponent({ 
  children, 
  fallback = null, 
  loadingMessage = "Chargement...",
  errorMessage = "Une erreur est survenue dans ce composant"
}) {
  return (
    <ErrorBoundary fallback={fallback}>
      <Suspense fallback={<LoadingSpinner message={loadingMessage} />}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
}

// Hook pour opérations sécurisées
export function useSafeAsync(asyncFn, dependencies = []) {
  const [state, setState] = React.useState({
    data: null,
    loading: true,
    error: null
  });

  const execute = React.useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const result = await asyncFn();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (error) {
      console.warn('[useSafeAsync] Error:', error);
      setState({ data: null, loading: false, error });
      return null;
    }
  }, dependencies);

  React.useEffect(() => {
    execute();
  }, dependencies);

  return { ...state, refetch: execute };
}