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

SVG uniquement. Ils sont affichés après nettoyage, donc un script embarqué ne s'exécute pas.

La séquence dure le temps de la pause, y compris si tu changes les minutes dans les réglages. Chaque SVG boucle pendant sa part. S'il n'y en a qu'un, il boucle pendant toute la pause. Si le minuteur est en pause, l'animation se fige.

```json
{
  "short": ["respiration.svg"],
  "long": ["vagues.svg", "nuages.svg"]
}
```
