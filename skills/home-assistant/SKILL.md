# HOME ASSISTANT SKILL - Smart Home Control

## Metadata
- **name**: home-assistant-control
- **description**: Control smart home devices via Home Assistant
- **trigger**: "liga/desliga [device]" ou "controla [dispositivo]"

---

## CONFIGURATION
```env
HA_URL=http://homeassistant.local:8123
HA_TOKEN=SEU_TOKEN_AQUI
```

---

## DEVICES AVAILABLE

| Device | Entity ID | Type |
|--------|-----------|------|
| TV LG | media_player.lg_webos_tv | media_player |
| Caixa de Som Quarto | media_player.caixa_quarto | media_player |
| Caixa de Som Sala | media_player.caixa_sala | media_player |
| Luz da Sala | light.luz_sala | light |
| Luz do Quarto | light.luz_quarto | light |
| Ar Condicionado | climate.ar_condicionado | climate |
| Chromecast | media_player.chromecast | media_player |

---

## COMMANDS

### TV Control
```python
async def tv_on():
    """Liga a TV LG"""
    await call_service("media_player", "turn_on", entity_id="media_player.lg_webos_tv")

async def tv_off():
    """Desliga a TV LG"""
    await call_service("media_player", "turn_off", entity_id="media_player.lg_webos_tv")

async def tv_volume_up():
    """Aumenta volume da TV"""
    await call_service("media_player", "volume_up", entity_id="media_player.lg_webos_tv")

async def tv_volume_down():
    """Diminui volume da TV"""
    await call_service("media_player", "volume_down", entity_id="media_player.lg_webos_tv")

async def set_input_hdmi():
    """Muda para entrada HDMI"""
    await call_service("media_player", "select_source", entity_id="media_player.lg_webos_tv", source="HDMI 1")
```

### Light Control
```python
async def luz_sala_on():
    """Liga luz da sala"""
    await call_service("light", "turn_on", entity_id="light.luz_sala")

async def luz_sala_off():
    """Desliga luz da sala"""
    await call_service("light", "turn_off", entity_id="light.luz_sala")

async def luz_quarto_on():
    """Liga luz do quarto"""
    await call_service("light", "turn_on", entity_id="light.luz_quarto")

async def luz_quarto_off():
    """Desliga luz do quarto"""
    await call_service("light", "turn_off", entity_id="light.luz_quarto")
```

### Climate Control (Ar Condicionado)
```python
async def ac_on(temp=22):
    """Liga ar condicionado"""
    await call_service("climate", "turn_on", entity_id="climate.ar_condicionado")
    await call_service("climate", "set_temperature", entity_id="climate.ar_condicionado", temperature=temp)

async def ac_off():
    """Desliga ar condicionado"""
    await call_service("climate", "turn_off", entity_id="climate.ar_condicionado")

async def ac_set_temp(temp):
    """Define temperatura do ar"""
    await call_service("climate", "set_temperature", entity_id="climate.ar_condicionado", temperature=temp)
```

### Speaker Control
```python
async def speaker_quarto_on():
    """Liga caixa de som do quarto"""
    await call_service("media_player", "turn_on", entity_id="media_player.caixa_quarto")

async def speaker_sala_on():
    """Liga caixa de som da sala"""
    await call_service("media_player", "turn_on", entity_id="media_player.caixa_sala")

async def speaker_off():
    """Desliga todas as caixas de som"""
    await call_service("media_player", "turn_off", entity_id="media_player.caixa_quarto")
    await call_service("media_player", "turn_off", entity_id="media_player.caixa_sala")
```

---

## VOICE COMMANDS MAPPING

| User Says | Function Called |
|-----------|-----------------|
| "liga a TV" | tv_on() |
| "desliga a TV" | tv_off() |
| "aumenta volume" | tv_volume_up() |
| "diminui volume" | tv_volume_down() |
| "liga luz da sala" | luz_sala_on() |
| "desliga luz da sala" | luz_sala_off() |
| "liga luz do quarto" | luz_quarto_on() |
| "desliga luz do quarto" | luz_quarto_off() |
| "liga ar" / "liga AC" | ac_on() |
| "desliga ar" / "desliga AC" | ac_off() |
| "set temperatura 20" | ac_set_temp(20) |
| "liga som" | speaker_sala_on() |
| "desliga som" | speaker_off() |
| "liga Chromecast" | media_player.turn_on(entity_id="chromecast") |

---

## USAGE

```python
from skills.home_assistant import control_device

# Example commands
await control_device("liga a TV")
await control_device("liga luz da sala")
await control_device("liga ar condicionado")
await control_device("set temperatura 22")
```

---

## ERROR HANDLING

```python
try:
    await control_device(command)
except:
    return "Não consegui conectar ao Home Assistant. Verifique o token."
```

---

## TO USE

1. Create token in Home Assistant
2. Add to .env: HA_TOKEN=seu_token
3. Restart OpenClaw
4. Say commands in Telegram!