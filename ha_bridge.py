#!/usr/bin/env python3
"""
Home Assistant Bridge - OpenClaw Control
Rode este script no seu PC para controlar a casa via Telegram!
"""

import os
import requests
import json
from http.server import HTTPServer, BaseHTTPRequestHandler

# ================== CONFIGURAÇÃO ==================
# URL do seu Home Assistant (use IP local ou NabuCasa cloud)
HA_URL = os.getenv("HA_URL", "http://homeassistant.local:8123")

# Token de acesso (crie um em: Profile → Long-Lived Access Tokens)
HA_TOKEN = os.getenv("HA_TOKEN", "SEU_TOKEN_AQUI")

# Seu chat ID do Telegram
TELEGRAM_CHAT_ID = "998009360"

# Bot Token do Telegram (crie @BotFather)
TELEGRAM_BOT_TOKEN = "8745548804:AAGQlk-6hsmoYH6aux0KWoqEXqoVYI10iQA"

HEADERS = {
    "Authorization": f"Bearer {HA_TOKEN}",
    "Content-Type": "application/json"
}

# ================== DISPOSITIVOS ==================
DEVICES = {
    "tv": "media_player.lg_webos_tv",
    "tv lg": "media_player.lg_webos_tv",
    "luz sala": "light.luz_sala",
    "luz do quarto": "light.luz_quarto",
    "luz quarto": "light.luz_quarto",
    "ar": "climate.ar_condicionado",
    "ar condicionado": "climate.ar_condicionado",
    "ac": "climate.ar_condicionado",
    "chromecast": "media_player.chromecast",
    "som": "media_player.caixa_sala",
    "caixa som": "media_player.caixa_sala"
}

# ================== FUNÇÕES ==================
def send_telegram(message):
    """Envia mensagem para o Telegram"""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    data = {"chat_id": TELEGRAM_CHAT_ID, "text": message}
    try:
        requests.post(url, json=data)
    except:
        pass

def call_ha_service(domain, service, entity_id, extra=None):
    """Chama serviço do Home Assistant"""
    url = f"{HA_URL}/api/services/{domain}/{service}"
    data = {"entity_id": entity_id}
    if extra:
        data.update(extra)
    
    try:
        r = requests.post(url, headers=HEADERS, json=data, timeout=10)
        return r.status_code == 200
    except Exception as e:
        print(f"Erro: {e}")
        return False

def control_device(command):
    """Interpreta comando e executa"""
    cmd = command.lower()
    
    # Luzes
    if "liga" in cmd and "luz" in cmd:
        if "sala" in cmd:
            return call_ha_service("light", "turn_on", "light.luz_sala")
        elif "quarto" in cmd:
            return call_ha_service("light", "turn_on", "light.luz_quarto")
    
    if "desliga" in cmd and "luz" in cmd:
        if "sala" in cmd:
            return call_ha_service("light", "turn_off", "light.luz_sala")
        elif "quarto" in cmd:
            return call_ha_service("light", "turn_off", "light.luz_quarto")
    
    # TV
    if "liga" in cmd and "tv" in cmd:
        return call_ha_service("media_player", "turn_on", "media_player.lg_webos_tv")
    
    if "desliga" in cmd and "tv" in cmd:
        return call_ha_service("media_player", "turn_off", "media_player.lg_webos_tv")
    
    # Ar Condicionado
    if "liga" in cmd and "ar" in cmd:
        return call_ha_service("climate", "turn_on", "climate.ar_condicionado")
    
    if "desliga" in cmd and "ar" in cmd:
        return call_ha_service("climate", "turn_off", "climate.ar_condicionado")
    
    # Temperature
    if "temperatura" in cmd or "graus" in cmd:
        import re
        nums = re.findall(r'\d+', cmd)
        if nums:
            temp = int(nums[0])
            call_ha_service("climate", "turn_on", "climate.ar_condicionado")
            return call_ha_service("climate", "set_temperature", 
                                   "climate.ar_condicionado", {"temperature": temp})
    
    return False

def get_status():
    """Pega status dos dispositivos"""
    url = f"{HA_URL}/api/states"
    try:
        r = requests.get(url, headers=HEADERS, timeout=10)
        states = r.json()
        
        msg = "🏠 STATUS HOME ASSISTANT\n\n"
        
        # Filter relevant devices
        relevant = [s for s in states if s.get("entity_id") in DEVICES.values()]
        
        for s in relevant:
            entity = s.get("entity_id", "")
            state = s.get("state", "unknown")
            msg += f"{entity}: {state}\n"
        
        return msg
    except Exception as e:
        return f"Erro: {e}"

# ================== WEB SERVER SIMPLES ==================
class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if "/status" in self.path:
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(get_status().encode())
        else:
            self.send_response(200)
            self.wfile.write(b"Home Assistant Bridge OK!")
    
    def do_POST(self):
        if "/control" in self.path:
            length = int(self.headers['Content-Length'])
            body = self.rfile.read(length).decode()
            command = json.loads(body).get("command", "")
            
            success = control_device(command)
            
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"success": success}).encode())
            
            # Notify via Telegram
            msg = f"✅ Comando executado: {command}" if success else f"❌ Falhou: {command}"
            send_telegram(msg)

# ================== MAIN ==================
if __name__ == "__main__":
    print("🏠 Home Assistant Bridge Started!")
    print(f"URL: {HA_URL}")
    print("Aguardando comandos...")
    
    # Testa conexão
    try:
        r = requests.get(f"{HA_URL}/api/", headers=HEADERS, timeout=5)
        print(f"✅ Conectado! Status: {r.status_code}")
    except Exception as e:
        print(f"⚠️ Não conseguiu conectar no HA: {e}")
        print("Configure HA_TOKEN no código ou use variável de ambiente")
    
    # Inicia servidor
    server = HTTPServer(("0.0.0.0", 8765), Handler)
    print("Servidor rodando em http://localhost:8765")
    print("Para testar: curl -X POST -d '{\"command\":\"liga tv\"}' http://localhost:8765/control")
    server.serve_forever()