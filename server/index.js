require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { google } = require('googleapis');
const ics = require('ics');
const multer = require('multer');
const pdfParseModule = require('pdf-parse');
const pdfParse = pdfParseModule.default || pdfParseModule;

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos en formato PDF.'));
    }
  }
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor de Cronogramia funcionando correctamente' });
});

const rateLimit = require('express-rate-limit');

const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minuto
  max: 3, // Máximo 3 peticiones por IP por minuto
  message: { error: 'Demasiadas peticiones. Por favor, esperá un minuto antes de intentar de nuevo.' }
});

async function processTextWithGroq(text, subject) {
  const today = new Date().toISOString().split('T')[0];

  const subjectInstruction = subject && subject.trim() !== ''
    ? `IMPORTANTE: La materia/asignatura se llama "${subject.trim()}". DEBES anteponer obligatoriamente este nombre exacto en el campo "summary" de cada evento (Ejemplo: "${subject.trim()} - Parcial 1").`
    : '';

  const systemPrompt = `Eres un asistente de IA especializado en extraer eventos de documentos.
La fecha de referencia de hoy es: ${today}. Asume el año actual a menos que el texto especifique otro.
${subjectInstruction}

Instrucciones de Horarios:
- Si el texto ESPECIFICA hora (ej: "a las 18hs", "de 14 a 16"): genera el ISO completo (ej: "2026-10-15T18:00:00-03:00") y pon "needsTime": false.
- Si el texto NO ESPECIFICA hora (ej: "Examen el 15/10"): pon la fecha en formato "YYYY-MM-DD" en "start" y "end", y pon "needsTime": true.

Estructura obligatoria del JSON:
{
  "events": [
    {
      "summary": "Título del evento",
      "description": "Detalles adicionales si existen",
      "start": "2026-10-15T18:00:00-03:00" o "2026-10-15",
      "end": "2026-10-15T20:00:00-03:00" o "2026-10-15",
      "needsTime": true o false
    }
  ]
}

Regla estricta: Devuelve solo el JSON válido sin marcas de markdown.`;

  const groqResponse = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'openai/gpt-oss-120b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    },
    {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const rawOutput = groqResponse.data.choices[0].message.content.trim();
  const parsedData = JSON.parse(rawOutput);
  let eventsList = parsedData.events || parsedData;
  if (!Array.isArray(eventsList)) eventsList = [eventsList];

  return eventsList.map(evt => {
    let start = evt.start || '';
    let end = evt.end || '';

    if (start && !start.includes('-03:00') && !start.endsWith('Z')) {
      if (start.length === 19) start += '-03:00';
    }
    if (end && !end.includes('-03:00') && !end.endsWith('Z')) {
      if (end.length === 19) end += '-03:00';
    }

    return { ...evt, start, end };
  });
}

//ANALIZAR TEXTO 
app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  try {
    const { text, subject } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Debes proporcionar un texto para analizar.' });
    }

    const events = await processTextWithGroq(text, subject);
    return res.json({ success: true, events });

  } catch (error) {
    console.error('Error analizando texto:', error.message);
    return res.status(500).json({ error: 'Error al analizar el texto con la IA.', details: error.message });
  }
});

//ANALIZAR ARCHIVO PDF SUBIDO
app.post('/api/analyze-pdf', analyzeLimiter, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ningún archivo PDF.' });
    }

    const subject = req.body.subject || '';

    const pdfData = await pdfParse(req.file.buffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim() === '') {
      return res.status(400).json({ error: 'No se pudo extraer texto del PDF (asegúrate de que no sea un documento escaneado como imagen).' });
    }

    const events = await processTextWithGroq(extractedText, subject);
    return res.json({ success: true, events });

  } catch (error) {
    console.error('Error analizando PDF:', error.message);
    return res.status(500).json({ error: 'Error al procesar el archivo PDF.', details: error.message });
  }
});

//GOOGLE OAUTH & CALENDAR
app.get('/auth/google', (req, res) => {
  const scopes = ['https://www.googleapis.com/auth/calendar.events'];
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  try {
    const { tokens } = await oauth2Client.getToken(code);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    res.redirect(`${frontendUrl}?tokens=${encodeURIComponent(JSON.stringify(tokens))}`);
  } catch (error) {
    console.error('Error en autenticación Google:', error);
    res.status(500).send('Error en la autenticación con Google');
  }
});

app.post('/api/calendar/insert', analyzeLimiter, async (req, res) => {
  try {
    const { tokens, events } = req.body;
    if (!tokens || !events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos.' });
    }

    oauth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const results = [];
    for (const evt of events) {
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: evt.summary,
          description: evt.description || '',
          start: { dateTime: evt.start, timeZone: 'America/Argentina/San_Luis' },
          end: { dateTime: evt.end, timeZone: 'America/Argentina/San_Luis' }
        }
      });
      results.push(response.data);
    }

    return res.json({ success: true, count: results.length, inserted: results });
  } catch (error) {
    console.error('Error insertando en Google Calendar:', error);
    return res.status(500).json({ error: 'No se pudieron guardar los eventos en Google Calendar.' });
  }
});

//EXPORTAR ARCHIVO .ICS
app.post('/api/calendar/export-ics', analyzeLimiter, (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ error: 'Se requiere una lista de eventos.' });
    }

    const icsEvents = events.map(evt => {
      const startDate = new Date(evt.start);
      const endDate = new Date(evt.end);

      return {
        title: evt.summary,
        description: evt.description || '',
        start: [
          startDate.getFullYear(),
          startDate.getMonth() + 1,
          startDate.getDate(),
          startDate.getHours(),
          startDate.getMinutes()
        ],
        end: [
          endDate.getFullYear(),
          endDate.getMonth() + 1,
          endDate.getDate(),
          endDate.getHours(),
          endDate.getMinutes()
        ]
      };
    });

    ics.createEvents(icsEvents, (error, value) => {
      if (error) return res.status(500).json({ error: 'Error generando archivo .ics' });
      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader('Content-Disposition', 'attachment; filename=cronograma.ics');
      res.send(value);
    });

  } catch (error) {
    console.error('Error exportando a ICS:', error);
    res.status(500).json({ error: 'Error generando el archivo de calendario.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});