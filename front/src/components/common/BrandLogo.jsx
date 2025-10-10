import React from "react";

export default function BrandLogo({ size = 56, withText = false, textClassName = "" }) {
  const url = "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/1bccfefd6_pulapay-logo1.jpg";
  const px = typeof size === "number" ? `${size}px` : size;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative rounded-2xl brand-ring shadow-brand hover:shadow-brand-strong transition-shadow duration-300"
        style={{ width: px, height: px }}
        aria-label="Pulapay logo"
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#2EB67D] via-[#3fd68f] to-[#FF6B35] opacity-20 blur-[6px]" />
        <img
          src={url}
          alt="Pulapay"
          className="relative z-10 w-full h-full object-contain rounded-2xl"
          loading="eager"
        />
      </div>
      {withText && (
        <div className={`leading-tight ${textClassName}`}>
          <div className="font-extrabold text-xl tracking-tight text-neutral-900">Pulapay</div>
          <div className="text-xs text-neutral-500">Paiements • Afrique</div>
        </div>
      )}
    </div>
  );
}