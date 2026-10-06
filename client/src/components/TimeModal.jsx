import React, { useState, useEffect } from 'react';
import { Clock, Check, X } from 'lucide-react';
import formatDate from '../utils/formatDate';

export default function TimeModal({ event, isOpen, onClose, onSave }) {
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('11:00');

  useEffect(() => {
    if (event?.start && event.start.includes('T')) {
      const timePart = event.start.split('T')[1];
      if (timePart) setStartTime(timePart.slice(0, 5));
    }
    if (event?.end && event.end.includes('T')) {
      const timePart = event.end.split('T')[1];
      if (timePart) setEndTime(timePart.slice(0, 5));
    }
  }, [event]);

  if (!isOpen || !event) return null;

  const handleConfirm = () => {
    const dateStr = event.start.split('T')[0];
    const fullStart = `${dateStr}T${startTime}:00-03:00`;
    const fullEnd = `${dateStr}T${endTime}:00-03:00`;

    onSave({
      ...event,
      start: fullStart,
      end: fullEnd,
      needsTime: false // Se marca que ya fue definido/confirmado por el usuario
    });
  };

  const dateStr = event.start ? event.start.split('T')[0] : '';

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-xl border border-yellow-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Ajustar Horario</h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
          Seleccioná el horario para<br/><strong>{event.summary}</strong><br/>El día {formatDate(event.start)}.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Hora de Inicio</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-yellow-500 focus:outline-none cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Hora de Fin</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-sm font-medium focus:ring-2 focus:ring-yellow-500 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="w-full py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-xs rounded-xl shadow-sm transition flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Horario</span>
          </button>
        </div>

      </div>
    </div>
  );
}