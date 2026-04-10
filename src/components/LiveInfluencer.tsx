import React, { useState } from "react";
import { Conversation } from "./cvi/components/conversation";

const LiveInfluencer: React.FC = () => {
  const [conversationUrl, setConversationUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startLiveConversation = async () => {
    setLoading(true);
    setError(null);
    try {
      const pId = import.meta.env.VITE_PERSONA_ID; 
      const rId = import.meta.env.VITE_REPLICA_ID;
      
      const response = await fetch("https://tavusapi.com/v2/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_TAVUS_API_KEY || "",
        },
        body: JSON.stringify({
          replica_id: rId,
          persona_id: pId,
          conversational_context: "Você é a Dra. Olivia, uma assistente de farmácia brasileira. Responda sempre em Português do Brasil.",
          layers: {
             transport: {
                transport_type: "daily"
             }
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao iniciar conversa com Tavus");
      }

      const data = await response.json();
      setConversationUrl(data.conversation_url);
    } catch (err: any) {
      console.error("Tavus Error:", err);
      setError(err.message || "Erro desconhecido ao conectar com a IA");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-card" style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
      <div className="form-card-title">
        <span>🎙️</span> Live Influencer (Real-time)
      </div>
      <p className="form-card-desc">
        Fale em tempo real com sua influenciadora farmacêutica. 
        Alimentado por Tavus CVI e Deepgram para ultra-baixa latência.
      </p>

      {!conversationUrl ? (
        <div style={{ padding: '40px 20px' }}>
          <div style={{ marginBottom: '30px', opacity: 0.8 }}>
             <p>A IA está pronta para interagir com você.</p>
             <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '10px' }}>
               👉 **Nota sobre áudio:** Se não ouvir nada, clique em qualquer lugar do vídeo após iniciar.
             </p>
             <p style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>
               📣 Certifique-se que seu microfone está permitido no Chrome (ícone de câmera na barra de endereço).
             </p>
          </div>

          <button
            onClick={startLiveConversation}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '15px 40px', fontSize: '18px' }}
          >
            {loading ? "Iniciando stream..." : "🚀 Iniciar Conversa Ao Vivo"}
          </button>

          {error && (
            <div className="error-card" style={{ marginTop: '20px' }}>
              <p>✖ {error}</p>
            </div>
          )}
        </div>
      ) : (
        <div style={{ width: "100%", minHeight: "600px", background: '#000', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <Conversation
            conversationUrl={conversationUrl}
            onLeave={() => setConversationUrl(null)}
          />
        </div>
      )}

      {conversationUrl && (
        <div style={{ marginTop: '20px' }}>
             <button 
                onClick={() => setConversationUrl(null)} 
                className="btn-secondary"
             >
                Encerrar Chamada
             </button>
        </div>
      )}
    </div>
  );
};

export default LiveInfluencer;
