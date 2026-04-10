
import React, { useEffect, useState } from 'react';

interface Props {
  videoId: string;
  apiKey: string;
  onReady: (downloadUrl: string) => void;
}

export const TavusStatusTracker: React.FC<Props> = ({ videoId, apiKey, onReady }) => {
  const [status, setStatus] = useState<string>('queued');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;

    const checkStatus = async () => {
      try {
        const response = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, {
          headers: { 'x-api-key': apiKey }
        });
        
        if (!response.ok) throw new Error("Erro ao consultar status");
        
        const data = await response.json();
        setStatus(data.status);
        
        if (data.status === 'ready' && data.download_url) {
          onReady(data.download_url);
          clearInterval(interval);
        } else if (data.status === 'error') {
          setError(data.status_details || "Erro na renderização");
          clearInterval(interval);
        }
      } catch (err: any) {
        console.error(err);
      }
    };

    interval = setInterval(checkStatus, 10000); // Checa a cada 10 segundos
    checkStatus();

    return () => clearInterval(interval);
  }, [videoId, apiKey]);

  const getStatusDisplay = () => {
    switch(status) {
      case 'queued': return { icon: '⏳', text: 'Na fila do servidor...', color: '#FBBF24' };
      case 'generating': return { icon: '⚙️', text: 'Renderizando Dra. Olivia...', color: '#60A5FA' };
      case 'ready': return { icon: '✅', text: 'Vídeo Finalizado!', color: '#34D399' };
      case 'error': return { icon: '❌', text: 'Erro no processamento', color: '#F87171' };
      default: return { icon: '🌀', text: 'Sincronizando...', color: '#9CA3AF' };
    }
  };

  const display = getStatusDisplay();

  return (
    <div style={{ 
      marginTop: '15px', 
      padding: '12px 20px', 
      background: 'rgba(255,255,255,0.03)', 
      borderRadius: '10px',
      border: `1px solid ${display.color}44`,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '20px' }}>{display.icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: display.color }}>{display.text}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {videoId}</div>
      </div>
      {status === 'generating' && <div className="loading-spinner" style={{ width: 16, height: 16, borderWeight: 2, margin: 0 }} />}
    </div>
  );
};
