# HOOK ENGINE - Ganchos Ultra-Retentivos

## Metadata
- **name**: hook-engine
- **description**: Gera ganchos (hooks) ultra-retentivos para vídeos virais
- **trigger**: "gera hook para [tema]" ou "cria gancho viral"

---

## FÓRMULA BASE
```
[EMOJI] + [TENSÃO] + [CURIOSIDADE] + [PROMESSA]
```

---

## GATILHOS POR NICHO

### Farmácia / Saúde
```
💊 Você sabia que a indústria farmacêutica não quer que você saiba isso?
🧪 O remédio que você tá taking pode estar errado
💔 Elles tão recolhendo isso das prateleiras agora
🔥 Guarda isso antes que deletem!
```

### Beleza / Cosméticos
```
✨ O segredo que as dermatologistas não te contam...
💄 O produto que todas as influenciadoras usam...
🌸 O erro que você comete com seu rosto
```

### Fitness / Saúde
```
🏃 O exercício que Queima mais gordura que corrida
💪 O supplement que funciona (e qual não)
🥗 O erro que sabotando seus resultados
```

---

## FUNÇÃO DE GERAÇÃO

```python
def generate_hook(tema: str, nicho: str) -> Hook:
    templates = get_templates(nicho)
    template = random.choice(templates)
    
    return Hook(
        texto=template + " " + tema,
        duracao=3,  # 3 segundos máx
        emoji=random_emoji(tipo="tensã"),
        gatilho=get_gatilho(tipo)
    )
```

---

## TESTE

```python
hooks = [
    generate_hook("gripe", "farmacia"),
    generate_hook("sono", "saude"),
    generate_hook("cabelo", "beleza"),
]
# Retorna: ganchos prontos para uso
```