import { useEffect, useState } from 'react';
import type { BodyType } from './AvatarCustomizer';
import { Scene } from './Scene';

interface MessageData {
  type: 'SET_TOP' | 'SET_PANTS' | 'SET_SHOES' | 'SET_EYES' | 'SET_HAIR' | 'SET_BODY' | 'TOGGLE_VISIBILITY';
  value: string;
  part?: string; // For visibility toggling
  visible?: boolean; // For visibility toggling
}

function App() {
  const [bodyType, setBodyType] = useState<BodyType>('female');
  const [topTexture, setTopTexture] = useState<string>('top_default');
  const [pantsTexture, setPantsTexture] = useState<string>('pants_default');
  const [shoesTexture, setShoesTexture] = useState<string>('shoes_default');
  const [eyesTexture, setEyesTexture] = useState<string>('eyes_default');
  const [hairTexture, setHairTexture] = useState<string>('hair_default');
  const [visibleParts, setVisibleParts] = useState({
    hair: true,
    top: true,
    pants: true,
    shoes: true,
  });

  useEffect(() => {
    // Listen for messages from the parent (Expo WebView)
    const handleMessage = (event: MessageEvent) => {
      try {
        const data: MessageData = JSON.parse(event.data);
        
        switch (data.type) {
          case 'SET_BODY':
            if (['female', 'female1', 'female2', 'female3', 'male', 'male1', 'male2', 'male3'].includes(data.value)) {
              setBodyType(data.value as BodyType);
              console.log('📨 Received SET_BODY:', data.value);
            }
            break;
          case 'SET_TOP':
            setTopTexture(data.value);
            console.log('📨 Received SET_TOP:', data.value);
            break;
          case 'SET_PANTS':
            setPantsTexture(data.value);
            console.log('📨 Received SET_PANTS:', data.value);
            break;
          case 'SET_SHOES':
            setShoesTexture(data.value);
            console.log('📨 Received SET_SHOES:', data.value);
            break;
          case 'SET_EYES':
            setEyesTexture(data.value);
            console.log('📨 Received SET_EYES:', data.value);
            break;
          case 'SET_HAIR':
            setHairTexture(data.value);
            console.log('📨 Received SET_HAIR:', data.value);
            break;
          case 'TOGGLE_VISIBILITY':
            if (data.part && data.visible !== undefined) {
              setVisibleParts(prev => ({
                ...prev,
                [data.part!]: data.visible
              }));
              console.log('📨 Received TOGGLE_VISIBILITY:', data.part, data.visible);
            }
            break;
          default:
            console.warn('Unknown message type:', data.type);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    // Listen for messages from parent window (WebView)
    window.addEventListener('message', handleMessage);
    
    // Also listen for postMessage from React Native WebView
    document.addEventListener('message', handleMessage as any);

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage as any);
    };
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0 }}>
      {/* 3D Scene */}
      <Scene 
        bodyType={bodyType}
        topTexture={topTexture}
        pantsTexture={pantsTexture}
        shoesTexture={shoesTexture}
        eyesTexture={eyesTexture}
        hairTexture={hairTexture}
        visibleParts={visibleParts}
      />
    </div>
  );
}

export default App;