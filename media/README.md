# Médias de pause

Dépose tes fichiers directement dans le dossier `media/`, puis ajoute leur nom dans `media/media.json`.

## Structure

Tous les fichiers (musiques et animations) sont réunis directement dans `media/` :

```text
media/
├── media.json
├── *.mp3 (ou ogg, wav, m4a)
└── *.svg
```

## Configuration (`media/media.json`)

```json
{
  "music": [
    "zen calming.mp3",
    "zen garden.mp3",
    "zen music 01.mp3",
    "zen music 02.mp3",
    "zen piano.mp3"
  ],
  "animations": [
    "Zen Ying-Yang.svg",
    "Zen Man.svg",
    "Zen Nenuphar.svg",
    "Zen Woman.svg"
  ]
}
```

- **Musique** : formats acceptés : `mp3`, `ogg`, `wav`, `m4a`.
- **Animations** : format `svg` uniquement. Les animations bouclent et se figent automatiquement si le timer est en pause.
