import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Trash2, AlertCircle } from 'lucide-react';
import { getEventColor } from '../utils/colorPicker';
import TimeModal from './TimeModal';
import formatDate from '../utils/formatDate';

export default function EventCard({ event, onDelete, onUpdateEvent }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const palette = getEventColor(event.summary || 'evento');

  const formattedDate = formatDate(event.start);
  const startTime = event.start && event.start.includes('T') ? event.start.split('T')[1].slice(0, 5) : '09:00';
  const endTime = event.end && event.end.includes('T') ? event.end.split('T')[1].slice(0, 5) : '11:00';

  return (
    <>
      <div className={`p-5 rounded-2xl border transition-all ${palette.bg} ${palette.border} relative flex flex-col items-center justify-center text-center group shadow-sm hover:shadow-md`}>
        
        <button
          onClick={onDelete}
          className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-white/60 transition opacity-0 group-hover:opacity-100"
          title="Eliminar evento"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="space-y-3 w-full max-w-[90%] flex flex-col items-center">
          {/*Título y Descripción*/}
          <div>
            <h3 className={`font-bold text-base ${palette.text}`}>{event.summary}</h3>
            {event.description && (
              <p className="text-slate-600 text-xs sm:text-sm mt-1 leading-relaxed max-w-lg mx-auto">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-medium pt-1">
            {/* Fecha */}
            <div className="flex items-center space-x-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 text-slate-700 font-semibold shadow-2xs">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>

            {/* Horario */}
            {event.needsTime ? (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 bg-amber-100 hover:bg-amber-200/80 text-amber-800 px-3 py-1 rounded-lg border border-amber-300/60 text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="Hacé clic para cambiar la hora"
              >
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Sin hora (Asignado {startTime} - {endTime} hs) · Cambiar</span>
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-1.5 bg-white/90 hover:bg-white text-slate-700 px-3 py-1 rounded-lg border border-slate-200/80 text-xs font-semibold transition cursor-pointer shadow-2xs"
                title="Hacé clic para editar la hora"
              >
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
                <span>{startTime} - {endTime} hs</span>
              </button>
            )}
          </div>
        </div>

      </div>

      <TimeModal
        event={event}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(updatedEvent) => {
          onUpdateEvent(updatedEvent);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}