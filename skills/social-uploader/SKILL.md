# SOCIAL UPLOADER

## Metadata
- **name**: social-uploader
- **description**: Upload e agendamento para Instagram/TikTok
- **trigger**: "posta no instagram" ou "agenda vídeo para [data]"

---

## APIs SUPORTADAS

| Plataforma | API | Limite |
|------------|-----|-------|
| Instagram | Meta Graph API | 25 posts/dia |
| TikTok | TikTok API | 20 videos/dia |
| YouTube | YouTube Data API | 100 uploads/dia |

---

## CONFIGURAÇÃO

### .env
```env
# Instagram
INSTAGRAM_APP_ID=...
INSTAGRAM_APP_SECRET=...
INSTAGRAM_ACCESS_TOKEN=...

# TikTok
TIKTOK_CLIENT_KEY=...
TIKTOK_CLIENT_SECRET=...

# YouTube
YOUTUBE_API_KEY=...
```

---

## UPLOAD INSTAGRAM

```python
async def post_instagram(video_path: str, caption: str, hashtags: list[str]):
    # Valida tipo de arquivo
    if not video_path.endswith(('.mp4', '.jpg')):
        raise ValueError("Arquivo inválido")
    
    # Upload de vídeo
    container_id = await instagram.create_media_container(
        media_type="VIDEO",
        media=video_path,
        caption=caption + "\n\n" + " ".join(hashtags)
    )
    
    # Publica
    publish = await instagram.publish_media(container_id)
    
    return {
        "id": publish["id"],
        "permalink": publish["permalink"],
        "status": "published"
    }
```

---

## UPLOAD TIKTOK

```python
async def post_tiktok(video_path: str, title: str, hashtags: list[str]):
    # Upload para TikTok
    response = await tiktok.upload_video(
        video=video_path,
        title=title,
        privacy_type="public",
        hashtags=hashtags
    )
    
    return {
        "id": response["video_id"],
        "share_url": response["share_url"],
        "status": "uploaded"
    }
```

---

## AGENDAMENTO

```python
async def schedule_post(video_path: str, date: datetime, plataforma: str):
    """
    Agenda publicação para data futura
    """
    return await social.schedule(
        video=video_path,
        publish_at=date,
        platform=plataforma
    )
```

---

## BOAS PRÁTICAS (Para não ser bloqueado)

1. **Máximo 5 posts/dia** por plataforma
2. **Intervalo mínimo** de 2 horas entre posts
3. **Legendas naturais** - não usar spammy patterns
4. **Não repostar** o mesmo conteúdo exato
5. **Usar hashtags diferentes** a cada post

---

## ERROS COMUNS

| Erro | Solução |
|------|--------|
| #1744 | Video muito longo |
| #1745 | Formato não suportado |
| #1905 | Rate limit atingido |
| #1900 | Token expirado |

---

## USO

```python
from skills.social_uploader import post_instagram, post_tiktok

# Postar no Instagram
await post_instagram(
    video_path="dra_olivia_viral.mp4",
    caption="💊 Nueva découverte!",
    hashtags=["#farmacia", "#draolivia", "#saude"]
)

# Postar no TikTok
await post_tiktok(
    video_path="dra_olivia_viral.mp4",
    title="Remédio para gripe",
    hashtags=["farmacia", "saude", "draolivia"]
)
```