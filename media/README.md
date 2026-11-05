# Médias de pause

Dépose les fichiers, puis ajoute le nom exact dans le JSON du même type.

## Musique

- Pause courte : `media/music/short/`
- Pause longue : `media/music/long/`
- Liste : `media/music/playlist.json`

Extensions acceptées : `mp3`, `ogg`, `wav`, `m4a`.

Nom de fichier : lettres, chiffres, espaces, point, tiret, underscore. Pas de dossier dans le nom.

```json
{
  "short": ["pluie.mp3"],
  "long": ["calme.ogg"]
}
```

## Animations

- Pause courte : `media/animations/short/`
- Pause longue : `media/animations/long/`
- Liste : `media/animations/animations.json`

SVG uniquement. Ils sont affichés comme images, donc un script embarqué dans le SVG ne s'exécute pas.

```json
{
  "short": ["respiration.svg"],
  "long": ["vagues.svg"]
}
```
