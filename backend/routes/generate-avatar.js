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
  const styleStr  = STYLE_MAP[style]  ?? style;
  const moodStr   = MOOD_MAP[mood]    ?? mood;
  const bgStr     = BG_MAP[background] ?? background;
  const traitStr  = traits?.length ? traits.join(', ') : '';

  const positive = [
    'masterpiece, best quality, ultra detailed, NFT art, trending on artstation',
    'highly detailed face, perfect anatomy, centered portrait, symmetrical composition',
    'sharp focus, 8k resolution, professional illustration, single character',
    '(portrait:1.3), (face focus:1.2), upper body',
    styleStr,
    character,
    traitStr,
    moodStr,
    bgStr,
    'intricate details, cinematic lighting, no text, no watermark',
  ].filter(Boolean).join(', ');

  const negative = [
    'low quality, blurry, bad anatomy, extra limbs, distorted face',
    'watermark, text, logo, cropped, worst quality, deformed, ugly',
    'out of frame, duplicate, mutated hands, missing fingers',
    'multiple people, crowd, abstract, incoherent, noisy, grainy',
    'bad proportions, disfigured, poorly drawn face, mutation',
  ].join(', ');

  return { positive, negative };
}

// ─── PARAM MAPPERS ────────────────────────────────────────────────────────────
const mapCreativity = (v) => 8 + Math.round((v / 100) * 4);   // 8–12 (higher floor)
const mapDetail     = (v) => 35 + Math.round((v / 100) * 15); // 35–50 (never go below 35)

// ─── POST /api/generate-avatar ────────────────────────────────────────────────
router.post('/', async (req, res) => {
  const { style, character, traits, mood, background, seed, creativity = 65, detail = 70 } = req.body;

  if (!character?.trim()) {
    return res.status(400).json({ success: false, message: 'character is required' });
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || apiKey === 'your_huggingface_api_key_here') {
    return res.status(500).json({ success: false, message: 'HUGGINGFACE_API_KEY not configured in backend/.env' });
  }

  const { positive, negative } = buildPrompt({ style, character, traits, mood, background });
  const guidance_scale       = mapCreativity(creativity);
  const num_inference_steps  = mapDetail(detail);

  const body = {
    inputs: positive,
    parameters: {
      negative_prompt: negative,
      guidance_scale,
      num_inference_steps,
      width: 512,
      height: 512,
      ...(seed ? { seed: parseInt(seed, 10) } : {}),
    },
  };

  try {
    const hfRes = await fetch(
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
            negative_prompt: negative,
            guidance_scale,
            num_inference_steps,
            width: 512,
            height: 512,
            ...(seed ? { seed: parseInt(seed, 10) } : {}),
          },
        }),
      }
    );

    if (!hfRes.ok) {
      const errText = await hfRes.text();
      console.error('HF error:', hfRes.status, errText);
      if (hfRes.status === 503) {
        return res.status(503).json({ success: false, message: 'Model is loading, please retry in ~20 seconds.' });
      }
      return res.status(hfRes.status).json({ success: false, message: `HuggingFace error: ${errText}` });
    }

    const arrayBuffer = await hfRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    return res.json({ success: true, image: base64, prompt: positive });

  } catch (err) {
    console.error('generate-avatar error:', err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
