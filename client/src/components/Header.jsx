import React from 'react';
import { CheckCircle2, LogIn } from 'lucide-react';
import Logo from './Logo';

export default function Header({ tokens, onGoogleLogin }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
      <div className="space-y-1">
        {/* Contenedor alineado verticalmente: Logo + Título */}
        <div className="flex items-center space-x-3">
          <Logo />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-none">
            Cronogramia
          </h1>
        </div>

        {/* Subtítulo / Bajada */}
        <p className="text-slate-500 text-xs sm:text-sm pl-0.5">
          Extrae fechas de tus documentos y sincronízalas al instante
        </p>
      </div>

      <button
        onClick={onGoogleLogin}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
          tokens
            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 shadow-xs'
            : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs'
        }`}
      >
        {tokens ? (
          <>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Google Conectado</span>
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4 text-slate-500" />
            <span>Conectar Google Calendar</span>
          </>
        )}
      </button>
    </header>
  );
}