import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ message = "Chargement..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin mb-3"></div>
      <p className="text-sm text-neutral-600">{message}</p>
    </div>
  );
}