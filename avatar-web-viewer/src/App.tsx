import { useEffect, useState } from 'react';
import type { BodyType } from './AvatarCustomizer';
import { Scene } from './Scene';

interface MessageData {
  type: string;
  value: string;
  part?: string;
  visible?: boolean;
  selection?: number | null;
}

function App() {
  const [bodyType, setBodyType] = useState<BodyType>('female');
  const [topTexture, setTopTexture] = useState<string>('top_default');
  const [pantsTexture, setPantsTexture] = useState<string>('pants_default');
  const [shoesTexture, setShoesTexture] = useState<string>('shoes_default');
  const [eyesTexture, setEyesTexture] = useState<string>('eyes_default');
  const [hairTexture, setHairTexture] = useState<string>('hair_default');
  const [visibleParts, setVisibleParts] = useState({ hair: true, top: true, pants: true, shoes: true });
  const [accessories, setAccessories] = useState({
    jacket: null as number | null, pants: null as number | null,
    hair: null as number | null, mask: null as number | null,
    fullSuit: null as number | null, shoes: null as number | null,
  });
  // Accessory colors — null means use original GLB material
  const [accessoryColors, setAccessoryColors] = useState({
    jacket: null as string | null, pants: null as string | null,
    hair: null as string | null, mask: null as string | null,
    fullSuit: null as string | null, shoes: null as string | null,
  });

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data: MessageData = JSON.parse(event.data);
        switch (data.type) {
          case 'SET_BODY':
            if (['female','female1','female2','female3','male','male1','male2','male3'].includes(data.value))
              setBodyType(data.value as BodyType);
            break;
          case 'SET_TOP':    setTopTexture(data.value);   break;
          case 'SET_PANTS':  setPantsTexture(data.value); break;
          case 'SET_SHOES':  setShoesTexture(data.value); break;
          case 'SET_EYES':   setEyesTexture(data.value);  break;
          case 'SET_HAIR':   setHairTexture(data.value);  break;
          case 'TOGGLE_VISIBILITY':
            if (data.part && data.visible !== undefined)
              setVisibleParts(prev => ({ ...prev, [data.part!]: data.visible }));
            break;
          case 'SET_JACKET':          setAccessories(p => ({ ...p, jacket:   data.selection ?? null })); break;
          case 'SET_PANTS_ACCESSORY': setAccessories(p => ({ ...p, pants:    data.selection ?? null })); break;
          case 'SET_HAIR_ACCESSORY':  setAccessories(p => ({ ...p, hair:     data.selection ?? null })); break;
          case 'SET_MASK_ACCESSORY':  setAccessories(p => ({ ...p, mask:     data.selection ?? null })); break;
          case 'SET_FULL_SUIT':       setAccessories(p => ({ ...p, fullSuit: data.selection ?? null })); break;
          case 'SET_SHOES_ACCESSORY': setAccessories(p => ({ ...p, shoes:    data.selection ?? null })); break;
          // ── Accessory color messages ──
          case 'SET_JACKET_COLOR': setAccessoryColors(p => ({ ...p, jacket:   data.value === 'default' ? null : data.value })); break;
          case 'SET_PANTS_COLOR':  setAccessoryColors(p => ({ ...p, pants:    data.value === 'default' ? null : data.value })); break;
          case 'SET_HAIR_COLOR':   setAccessoryColors(p => ({ ...p, hair:     data.value === 'default' ? null : data.value })); break;
          case 'SET_MASK_COLOR':   setAccessoryColors(p => ({ ...p, mask:     data.value === 'default' ? null : data.value })); break;
          case 'SET_SUIT_COLOR':   setAccessoryColors(p => ({ ...p, fullSuit: data.value === 'default' ? null : data.value })); break;
          case 'SET_SHOES_COLOR':  setAccessoryColors(p => ({ ...p, shoes:    data.value === 'default' ? null : data.value })); break;
          default: console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage as any);
    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as any);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      <Scene
        bodyType={bodyType}
        topTexture={topTexture}
        pantsTexture={pantsTexture}
        shoesTexture={shoesTexture}
        eyesTexture={eyesTexture}
        hairTexture={hairTexture}
        visibleParts={visibleParts}
        accessories={accessories}
        accessoryColors={accessoryColors}
      />
    </div>
  );
}

export default App;
