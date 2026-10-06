import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Download, ExternalLink, AlertCircle, FileText, Upload, FolderCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import Header from './components/Header';
import EventCard from './components/EventCard';

const API_BASE_URL = 'http://localhost:5000';

export default function App() {
  const [activeTab, setActiveTab] = useState('text');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState([]);
  const [tokens, setTokens] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tokensParam = urlParams.get('tokens');
    if (tokensParam) {
      try {
        const parsedTokens = JSON.parse(tokensParam);
        setTokens(parsedTokens);
        localStorage.setItem('cronogramia_tokens', JSON.stringify(parsedTokens));
        setStatusMsg({ type: 'success', text: '¡Cuenta de Google sincronizada!' });
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (err) {
        console.error('Error parseando tokens:', err);
      }
    } else {
      const savedTokens = localStorage.getItem('cronogramia_tokens');
      if (savedTokens) setTokens(JSON.parse(savedTokens));
    }
  }, []);

  const handleAnalyzeText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, { text, subject });
      if (res.data.success) {
        setEvents(res.data.events);
        setStatusMsg({ type: 'success', text: `Se extrajeron ${res.data.events.length} eventos exitosamente.` });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Error procesando el contenido.' });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzePDF = async () => {
    if (!file) return;
    setLoading(true);
    setStatusMsg({ type: '', text: '' });

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze-pdf`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        setEvents(res.data.events);
        setStatusMsg({ type: 'success', text: `Se extrajeron ${res.data.events.length} eventos del PDF.` });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.error || 'Error leyendo el PDF.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const handleSaveToGoogle = async () => {
    if (!tokens) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/calendar/insert`, { tokens, events });
      if (res.data.success) {
        setStatusMsg({ type: 'success', text: `¡${res.data.count} eventos añadidos a tu Google Calendar!` });
      }
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error guardando en el calendario.' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportICS = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/calendar/export-ics`, { events }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'eventos.ics');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error exportando el archivo .ics' });
    }
  };

  const handleUpdateEvent = (updatedEvt, index) => {
    const updatedEvents = [...events];
    updatedEvents[index] = updatedEvt;
    setEvents(updatedEvents);
  };

  const handleReset = () => {
    setEvents([]);
    setText('');
    setFile(null);
    setStatusMsg({ type: '', text: '' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        <Header tokens={tokens} onGoogleLogin={handleGoogleLogin} />

        {/* Notificación de Estado */}
        {statusMsg.text && (
          <div className={`p-4 rounded-xl border flex items-center space-x-3 text-sm font-medium ${
            statusMsg.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}>
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* PASO 1: VISTA DE ENTRADA (Se oculta cuando hay eventos detectados) */}
        {events.length === 0 && (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5 animate-in fade-in duration-200">
            
            {/* Categoría / Contexto */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500">
                Categoría / Contexto (Opcional)
              </label>
              <div className="relative">
                <FolderCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ej: Reuniones de Equipo, Proyecto X, Materia Y"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Selector de Pestañas */}
            <div className="flex border-b border-slate-200 space-x-4">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex items-center space-x-2 pb-2.5 text-sm font-medium border-b-2 transition ${
                  activeTab === 'text'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Texto Plano</span>
              </button>

              <button
                onClick={() => setActiveTab('pdf')}
                className={`flex items-center space-x-2 pb-2.5 text-sm font-medium border-b-2 transition ${
                  activeTab === 'pdf'
                    ? 'border-yellow-600 text-yellow-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Documento PDF</span>
              </button>
            </div>

            {/* Tab 1: Texto */}
            {activeTab === 'text' && (
              <div className="space-y-4">
                <textarea
                  rows="5"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Pegá aquí minutas de reunión, correos, cronogramas o avisos..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-yellow-500 transition resize-y"
                />
                <button
                  onClick={handleAnalyzeText}
                  disabled={loading || !text.trim()}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Procesando...' : 'Extraer Fechas'}</span>
                </button>
              </div>
            )}

            {/* Tab 2: PDF */}
            {activeTab === 'pdf' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 hover:border-yellow-400 bg-slate-50/50 rounded-xl p-6 text-center transition">
                  <input
                    type="file"
                    accept="application/pdf"
                    id="pdf-upload"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer space-y-2 block">
                    <div className="bg-yellow-50 text-yellow-600 w-10 h-10 rounded-xl mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">
                      {file ? file.name : 'Haz clic para seleccionar un archivo PDF'}
                    </p>
                  </label>
                </div>

                <button
                  onClick={handleAnalyzePDF}
                  disabled={loading || !file}
                  className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-xl shadow-sm transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Procesando PDF...' : 'Analizar Documento'}</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* PASO 2: VISTA DE REVISIÓN Y RESULTADOS (Aparece únicamente cuando hay eventos) */}
        {events.length > 0 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            
            {/* Barra Superior con Botón Volver y Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
              <button
                onClick={handleReset}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-xs font-semibold px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl transition w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Analizar otro documento</span>
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={handleExportICS}
                  className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition flex items-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar .ICS</span>
                </button>

                <button
                  onClick={handleSaveToGoogle}
                  disabled={loading || !tokens}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Guardar en Google</span>
                </button>
              </div>
            </div>

            {/* Listado de Tarjetas */}
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider px-1">
                Eventos Detectados ({events.length})
              </h2>

              <div className="grid gap-3">
                {events.map((evt, idx) => (
                  <EventCard
                    key={idx}
                    event={evt}
                    onDelete={() => {
                      const updated = events.filter((_, i) => i !== idx);
                      setEvents(updated);
                    }}
                    onUpdateEvent={(updatedEvt) => handleUpdateEvent(updatedEvt, idx)}
                  />
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}