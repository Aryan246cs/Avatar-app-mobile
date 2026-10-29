const express = require('express');
const router = express.Router();

// ─── STYLE MAPPINGS ───────────────────────────────────────────────────────────
const STYLE_MAP = {
  anime:    'anime style, cel shading, vibrant colors, studio ghibli inspired',
  cartoon:  'cartoon style, bold outlines, flat colors, pixar inspired',
  nft:      'NFT avatar style, sharp edges, high contrast, stylized lighting, bored ape inspired',
  cyberpunk:'cyberpunk, neon lights, futuristic, glowing elements, blade runner aesthetic',
  fantasy:  'fantasy art, magical, epic lighting, artstation trending',
};

const MOOD_MAP = {
  dramatic:  'dramatic lighting, high contrast shadows, intense atmosphere',
  cinematic: 'cinematic lighting, golden hour, depth of field, film grain',
  soft:      'soft lighting, pastel tones, gentle shadows, dreamy atmosphere',
  neon:      'neon lighting, vibrant glow, electric colors, night scene',
};

const BG_MAP = {
  plain:           'simple clean background, solid color backdrop',
  abstract:        'abstract geometric background, colorful shapes',
  futuristic_city: 'futuristic city background, neon skyline, cyberpunk cityscape',
  galaxy:          'galaxy background, stars, nebula, cosmic space',
};

// ─── PROMPT BUILDER ───────────────────────────────────────────────────────────
function buildPrompt({ style, character, traits, mood, background }) {
  const styleStr = STYLE_MAP[style]  ?? style;
  const moodStr  = MOOD_MAP[mood]    ?? mood;
  const bgStr    = BG_MAP[background] ?? background;
  const traitStr = traits?.length ? traits.join(', ') : '';

  const positive = [
    `A highly detailed ${styleStr} portrait of ${character || 'a character'}`,
    traitStr ? `wearing ${traitStr}` : '',
    moodStr,
    bgStr,
    'centered composition, upper body shot, sharp focus, professional digital art, 8k resolution',
    'intricate details, no text, no watermark, single character',
  ].filter(Boolean).join(', ');

  const negative = [
    'low quality, blurry, bad anatomy, extra limbs, distorted face',
    'watermark, text, logo, cropped, worst quality, deformed, ugly',
    'out of frame, duplicate, mutated hands, missing fingers',
    'multiple people, crowd, noisy, grainy, bad proportions',
  ].join(', ');

  return { positive, negative };
}

// ─── HUGGINGFACE (FLUX.1-schnell) ─────────────────────────────────────────────
// Free tier, no negative prompt support, 4-step distilled model
async function generateWithHuggingFace({ positive, seed }) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    throw new Error('HUGGINGFACE_API_KEY not configured in backend/.env');
  }

  const res = await fetch(
    'https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'image/png',
      },
      body: JSON.stringify({
        inputs: positive,
        parameters: {
          num_inference_steps: 4,
          width: 768,
          height: 768,
          ...(seed ? { seed: parseInt(seed, 10) } : {}),
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 503) throw new Error('Model is loading, please retry in ~20 seconds.');
    throw new Error(`HuggingFace error ${res.status}: ${errText}`);
  }

  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

// ─── STABILITY AI (Stable Diffusion 3.5) ─────────────────────────────────────
// Paid (25 free credits on signup), full negative prompt + CFG support
// Much more controllable output, better anatomy, proper avatar quality
async function generateWithStability({ positive, negative, seed }) {
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey || apiKey === 'your_stability_api_key_here') {
    throw new Error('STABILITY_API_KEY not configured in backend/.env — get a free key at https://platform.stability.ai');
  }

  const formData = new FormData();
  formData.append('prompt', positive);
  formData.append('negative_prompt', negative);
  formData.append('output_format', 'png');
  formData.append('width', '768');
  formData.append('height', '768');
  formData.append('cfg_scale', '7');          // How closely to follow the prompt (1-10)
  formData.append('steps', '30');             // More steps = more detail (20-50)
  formData.append('style_preset', 'digital-art'); // Built-in style boost
  if (seed) formData.append('seed', String(parseInt(seed, 10)));

  const res = await fetch(
    'https://api.stability.ai/v2beta/stable-image/generate/core',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'image/*',
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 402) throw new Error('Stability AI: out of credits. Top up at platform.stability.ai');
    if (res.status === 401) throw new Error('Stability AI: invalid API key. Check STABILITY_API_KEY in backend/.env');
    throw new Error(`Stability AI error ${res.status}: ${errText}`);
  }

  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

// ─── POST /api/generate-avatar ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { style, character, traits, mood, background, seed } = req.body;

  if (!character?.trim()) {
    return res.status(400).json({ success: false, message: 'character is required' });
  }

  const provider = (process.env.IMAGE_PROVIDER || 'huggingface').toLowerCase();
  const { positive, negative } = buildPrompt({ style, character, traits, mood, background });

  try {
    let base64;

    if (provider === 'stability') {
      base64 = await generateWithStability({ positive, negative, seed });
    } else {
      base64 = await generateWithHuggingFace({ positive, seed });
    }

    return res.json({ success: true, image: base64, prompt: positive, provider });

  } catch (err) {
    console.error('generate-avatar error:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
