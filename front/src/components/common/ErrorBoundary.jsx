import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Home, Bug, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Tentative de récupération automatique pour certains types d'erreurs
    if (this.state.retryCount < 2 && this.isRecoverableError(error)) {
      setTimeout(() => {
        this.handleRetry();
      }, 1000);
    }
  }

  isRecoverableError(error) {
    const recoverableErrors = [
      'NotFoundError',
      'NetworkError',
      'ChunkLoadError'
    ];
    return recoverableErrors.some(type => 
      error.name === type || error.message?.includes(type.toLowerCase())
    );
  }

  handleRetry = () => {
    this.setState(prev => ({ 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: prev.retryCount + 1 
    }));
    
    if (typeof this.props.onReset === "function") {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Si on a un fallback personnalisé, l'utiliser
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white p-4 md:p-8 flex items-center justify-center">
          <div className="max-w-lg w-full">
            <Card className="card-glow border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  Oups, une erreur est survenue
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-neutral-600">
                  L'application a rencontré un problème technique. Cela peut être dû à une connexion instable ou un problème temporaire.
                </p>
                
                {this.state.retryCount > 0 && (
                  <div className="bg-orange-50 p-3 rounded-xl border border-orange-200">
                    <p className="text-orange-800 text-sm">
                      Tentative automatique {this.state.retryCount}/2 effectuée
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={this.handleRetry} className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Réessayer
                  </Button>
                  <Link to={createPageUrl("Dashboard")}>
                    <Button variant="outline">
                      <Home className="w-4 h-4 mr-2" />
                      Accueil
                    </Button>
                  </Link>
                </div>
                
                <details className="text-xs text-neutral-500 mt-2">
                  <summary className="cursor-pointer hover:text-neutral-700">Détails techniques</summary>
                  <div className="mt-2 p-2 bg-neutral-100 rounded">
                    <pre className="whitespace-pre-wrap text-xs">
                      {this.state.error?.name}: {this.state.error?.message}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}