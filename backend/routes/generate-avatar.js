const express = require('express');
const router = express.Router();
const { InferenceClient } = require('@huggingface/inference');
const auth = require('../middleware/auth');
const generationLimit = require('../middleware/generation-limit');

const HUGGINGFACE_IMAGE_MODEL = 'Qwen/Qwen-Image';
const CLOUDFLARE_IMAGE_MODEL = '@cf/bytedance/stable-diffusion-xl-lightning';

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

// ─── HUGGING FACE INFERENCE PROVIDERS (Qwen-Image) ────────────────────────────
async function generateWithHuggingFace({ positive, negative, seed }) {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey || /your_|placeholder/i.test(apiKey)) {
    throw new Error('HUGGINGFACE_API_KEY not configured in backend/.env');
  }

  const client = new InferenceClient(apiKey);
  const parameters = { negative_prompt: negative, width: 1024, height: 1024 };
  const parsedSeed = seed === undefined || seed === null || seed === '' ? null : Number.parseInt(seed, 10);
  if (Number.isInteger(parsedSeed)) parameters.seed = parsedSeed;

  const image = await client.textToImage({
    model: HUGGINGFACE_IMAGE_MODEL,
    inputs: positive,
    parameters,
  });

  const buffer = await image.arrayBuffer();
  return Buffer.from(buffer).toString('base64');
}

// ─── CLOUDFLARE WORKERS AI (SDXL-Lightning) ─────────────────────────────────
// A fast 4-step image model that accepts the app's positive/negative prompts.
async function generateWithCloudflare({ positive, negative, seed }) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !/^[a-f0-9]{32}$/i.test(accountId)) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID is missing or invalid in backend/.env');
  }
  if (!apiToken || /your_|placeholder/i.test(apiToken)) {
    throw new Error('CLOUDFLARE_API_TOKEN is missing in backend/.env');
  }

  const payload = {
    prompt: positive.slice(0, 2048),
    negative_prompt: negative.slice(0, 2048),
    width: 768,
    height: 768,
    num_steps: 4,
  };
  const parsedSeed = seed === undefined || seed === null || seed === '' ? null : Number(seed);
  if (Number.isSafeInteger(parsedSeed) && parsedSeed >= 0 && parsedSeed <= 2_147_483_647) payload.seed = parsedSeed;

  let response;
  try {
    response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${CLOUDFLARE_IMAGE_MODEL}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
          Accept: 'image/png, application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(90_000),
      }
    );
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new Error('Cloudflare image generation timed out. Please try again.');
    }
    throw new Error('Could not reach Cloudflare Workers AI. Check the backend network connection.');
  }

  const contentType = response.headers.get('content-type') || '';
  const bytes = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    if (response.status === 401) throw new Error('Cloudflare rejected the API token. Check its Workers AI permissions.');
    if (response.status === 403) throw new Error('Cloudflare denied this model request. Check Workers AI access and account limits.');
    if (response.status === 429) throw new Error('Cloudflare rate limit reached. Please wait and try again.');
    if (response.status >= 500) throw new Error('Cloudflare image generation is temporarily unavailable. Please try again.');
    throw new Error(`Cloudflare image request failed (${response.status}). Check the model settings.`);
  }

  // Workers AI may return image bytes directly or a JSON result with base64.
  let imageBytes = bytes;
  if (contentType.includes('application/json')) {
    let result;
    try { result = JSON.parse(bytes.toString('utf8')); }
    catch { throw new Error('Cloudflare returned an unreadable image response.'); }
    if (!result.success || typeof result.result?.image !== 'string') {
      throw new Error('Cloudflare did not return an image. Check the model response and account limits.');
    }
    imageBytes = Buffer.from(result.result.image, 'base64');
  }

  const isPng = imageBytes.length >= 8 && imageBytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = imageBytes.length >= 3 && imageBytes[0] === 0xff && imageBytes[1] === 0xd8 && imageBytes[2] === 0xff;
  if ((!contentType.startsWith('image/') && !contentType.includes('application/json')) || (!isPng && !isJpeg)) {
    throw new Error('Cloudflare returned an unsupported image format.');
  }
  return imageBytes.toString('base64');
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
router.post('/', auth, generationLimit, async (req, res) => {
  const { style, character, traits, mood, background, seed } = req.body;

  if (typeof character !== 'string' || !character.trim() || character.length > 500) {
    return res.status(400).json({ success: false, message: 'Character description is required (max 500 characters)' });
  }
  if (!Object.hasOwn(STYLE_MAP, style) || !Object.hasOwn(MOOD_MAP, mood) || !Object.hasOwn(BG_MAP, background))
    return res.status(400).json({ success: false, message: 'Invalid style, mood, or background' });
  if (!Array.isArray(traits) || traits.length > 12 || traits.some(t => typeof t !== 'string' || t.length > 40))
    return res.status(400).json({ success: false, message: 'Traits must be a list of up to 12 short strings' });

  const provider = (process.env.IMAGE_PROVIDER || 'cloudflare').toLowerCase();
  const { positive, negative } = buildPrompt({ style, character, traits, mood, background });

  try {
    let base64;

    if (provider === 'cloudflare') {
      base64 = await generateWithCloudflare({ positive, negative, seed });
    } else if (provider === 'stability') {
      base64 = await generateWithStability({ positive, negative, seed });
    } else if (provider === 'huggingface') {
      base64 = await generateWithHuggingFace({ positive, negative, seed });
    } else {
      return res.status(500).json({ success: false, message: 'Unsupported IMAGE_PROVIDER. Choose cloudflare, huggingface, or stability.' });
    }

    return res.json({ success: true, image: base64, prompt: positive, provider });

  } catch (err) {
    console.error('Avatar image generation failed:', err.message);
    return res.status(502).json({ success: false, message: err.message || 'Image generation failed. Check the configured provider and try again.' });
  }
});

module.exports = router;
