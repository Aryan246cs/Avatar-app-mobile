import { useEffect, useState } from 'react';
import { Scene } from './Scene';

interface MessageData {
  type: 'SET_TOP' | 'SET_PANTS' | 'SET_SHOES';
  value: string;
}

function App() {
  const [topTexture, setTopTexture] = useState<string>('top_default');
  const [pantsTexture, setPantsTexture] = useState<string>('pants_default');
  const [shoesTexture, setShoesTexture] = useState<string>('shoes_default');

  useEffect(() => {
    // Listen for messages from the parent (Expo WebView)
    const handleMessage = (event: MessageEvent) => {
      try {
        const data: MessageData = JSON.parse(event.data);
        
        switch (data.type) {
          case 'SET_TOP':
            setTopTexture(data.value);
            break;
          case 'SET_PANTS':
            setPantsTexture(data.value);
            break;
          case 'SET_SHOES':
            setShoesTexture(data.value);
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
      {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <div>Top: {topTexture}</div>
        <div>Pants: {pantsTexture}</div>
        <div>Shoes: {shoesTexture}</div>
      </div>

      {/* 3D Scene */}
      <Scene 
        topTexture={topTexture}
        pantsTexture={pantsTexture}
        shoesTexture={shoesTexture}
      />
    </div>
  );
}

export default App;