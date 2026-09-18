import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Prompt Enhancer for 360 ESDzign Worlds
  app.post('/api/enhance-prompt', async (req, res) => {
    try {
      const { prompt, style } = req.body;
      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback enhancement if API key is not yet set
        const enhanced = `${prompt.trim()}, ${style || 'digital painting'} style, seamless 360 equirectangular panorama, immersive panoramic horizon, cinematic volumetric lighting, 8k resolution, crisp horizon depth, vibrant atmosphere, no seams`;
        return res.json({ enhancedPrompt: enhanced });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `You are an expert 360-degree panoramic environment and world prompt engineer for ES Dzign ESDzign AI.
The user wants to generate a seamless 360 equirectangular panorama world.
User prompt: "${prompt}"
Selected style: "${style || 'Digital Painting'}"

Rewrite and enhance this into a rich, vivid, visual prompt suitable for generating an equirectangular 360-degree spherical world. Describe:
1. The 360-degree surroundings (ground/nadir, horizon line, sky/zenith).
2. Atmospheric lighting, time of day, color temperature, and weather.
3. Specific architectural or natural landmarks in the panoramic view.
4. Keep it concise, descriptive, and direct (max 50 words). Avoid preamble, conversational filler, or quotes.`,
      });

      const enhancedPrompt = response.text ? response.text.trim() : prompt;
      res.json({ enhancedPrompt });
    } catch (err: any) {
      console.error('Enhance prompt error:', err);
      // Graceful fallback
      const { prompt, style } = req.body;
      const fallback = `${prompt || 'epic fantasy realm'}, ${style || 'cinematic'}, 360 equirectangular panorama, seamless horizon, atmospheric volumetric lighting`;
      res.json({ enhancedPrompt: fallback });
    }
  });

  // Generate 360 World Metadata & Procedural Parameters
  app.post('/api/generate-world-meta', async (req, res) => {
    try {
      const { prompt, style } = req.body;
      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          title: prompt.slice(0, 32) || 'New 360 World',
          description: `A 360° ${style} world crafted from: ${prompt}`,
          lighting: {
            zenithColor: '#1e1b4b',
            horizonColor: '#6366f1',
            nadirColor: '#0f172a',
            sunColor: '#fef08a',
            fogDensity: 0.02,
            ambientIntensity: 0.8,
          },
          ambiance: 'wind',
          tags: [style.toLowerCase(), '360', 'panoramic'],
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Given the 360 ESDzign prompt: "${prompt}" and style: "${style}", generate world metadata in strictly JSON format.
Return an object with:
- "title": a poetic 2-4 word name for this 360 world
- "description": a 1-sentence immersive description
- "lighting": object with hex colors { "zenithColor", "horizonColor", "nadirColor", "sunColor" }, "sunElevation": number (0 to 90), "sunAzimuth": number (0 to 360), "fogDensity": number (0 to 0.05), "ambientIntensity": number (0.3 to 1.2)
- "ambiance": one of ["wind", "synth", "cosmic", "water", "forest", "cavern"]
- "elements": array of 3-5 key visual elements that appear around the 360 horizon
- "colorPalette": array of 4-5 hex colors matching the aesthetic`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text?.trim() || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Generate world meta error:', err);
      res.json({
        title: req.body.prompt ? req.body.prompt.slice(0, 24) : 'Atmospheric Realm',
        description: 'An expansive 360° panoramic environment.',
        lighting: {
          zenithColor: '#090d16',
          horizonColor: '#38bdf8',
          nadirColor: '#030712',
          sunColor: '#fdba74',
          fogDensity: 0.02,
          ambientIntensity: 0.9,
        },
        ambiance: 'cosmic',
        tags: ['esdzign', 'panoramic'],
      });
    }
  });

  // Serve public static assets (including custom 360 textures and logos)
  app.use(express.static(path.join(process.cwd(), 'public')));

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ESDzign server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
