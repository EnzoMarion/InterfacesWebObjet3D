# README - Projet Musée Égyptien 3D

Bienvenue dans le projet de fin de semestre MMI "Musée Égyptien 3D". Ce document détaille les interactions mises en place, les instructions pour explorer le projet, les difficultés rencontrées, le temps passé et les points à améliorer.

## Présentation du projet

Ce projet est un musée virtuel en 3D permettant d'explorer une collection d'artefacts égyptiens. L'utilisateur peut naviguer dans un environnement 3D, interagir avec les objets, et accéder à des informations historiques via une interface 2D. Le tout est développé avec HTML, CSS, JavaScript et BabylonJS.

## Instructions pour lancer le projet

1. **Prérequis :** Un navigateur web moderne (Chrome, Firefox, etc.) avec une connexion internet pour charger les dépendances BabylonJS via CDN.
2. **Installation :**
    - Clonnez le lien Github.
3. **Lancement :** faire "npm start" a la racine du projet. Une fenêtre modale de bienvenue s’affichera avec les instructions de base.
4. **Exploration :** Suivez les contrôles listés ci-dessous pour interagir avec le musée.

## Interactions mises en place

Voici la liste complète des interactions disponibles dans le projet :

### Navigation dans l’environnement 3D
- **Déplacement :** Touches `Z` (avant), `Q` (gauche), `S` (arrière), `D` (droite).
- **Saut :** Touche `Espace` (soumis à la gravité, actif uniquement en vue FPS).
- **Rotation caméra (FPS) :** Verrouillez la souris avec `C`, puis déplacez la souris pour regarder autour. Déverrouillez avec `Alt`.
- **Minimap :** Une carte 2D en bas à gauche montre la position de la caméra (point rouge) et des artefacts (points jaunes).

### Interaction avec les artefacts
- **Sélection :** Approchez-vous d’un artefact (distance < 10 unités) et appuyez sur `E` pour afficher ses informations et repositionner la caméra.
- **Zoom :** Utilisez la molette de la souris pour zoomer/dézoomer sur un artefact sélectionné.
- **Rotation automatique :** Cliquez sur "Activer Rotation" dans le panneau d’info pour faire tourner l’artefact automatiquement (désactivable avec "Désactiver Rotation").
- **Vues prédéfinies :** Boutons dans le panneau "Caméra" ("Vue de Haut", "Vue de Droite", etc.) pour repositionner la caméra autour de l’artefact.
- **Mode "Devenir l’œuvre" :** Cliquez sur "Devenir l'œuvre" pour incarner l’artefact sélectionné :
    - Déplacez-vous avec `ZQSD`.
    - Quittez avec `F`.

### Interface 2D et liens avec le 3D
- **Panneau d’info :** Affiche le nom et la description de l’artefact sélectionné. Bouton "Retour" (`E` ou clic) pour revenir à la vue FPS.
- **Liste des artefacts :** Cliquez sur un nom dans la liste pour sélectionner et voir l’artefact correspondant en 3D.
- **Visite guidée :** Cliquez sur "Visite Guidée" pour explorer automatiquement les artefacts dans l’ordre (1 à 10). Réglez le temps par œuvre avec l’input "Temps par œuvre (s)" (par défaut 15 secondes).

### Autres fonctionnalités
- **Aide :** Touche `A` ou clic sur "Musée Égyptien" (en haut) pour afficher le guide de démarrage. Fermez avec `Échap` ou "Commencer l’exploration".
- **Rechargement :** Touche `R` pour recharger la page (équivalent Ctrl+F5).
- **Crosshair :** Apparaît en mode FPS pour indiquer le centre de l’écran.

## Éléments à explorer pour l’évaluation

- **Navigation fluide :** Testez les contrôles ZQSD et le saut dans l’environnement (sol sableux + pyramide centrale).
- **Interactions avec les artefacts :** Essayez toutes les options (zoom, rotation, vues prédéfinies, mode "Devenir l’œuvre").
- **Visite guidée :** Lancez-la et ajustez le temps pour voir la transition entre les 10 artefacts.
- **Minimap :** Observez la correspondance entre la position caméra/artefacts en 3D et leur représentation 2D.
- **Esthétique :** Notez le thème égyptien (textures papyrus, couleurs dorées/marron, police Papyrus).

## Difficultés rencontrées

1. **Gestion de la caméra :**
    - Passer entre la vue FPS (1ère personne), la vue sur les artefacts (3ème personne), et le mode "Devenir l’œuvre" a été complexe. La synchronisation des positions et des cibles de la caméra a nécessité beaucoup d’ajustements.
    - Le déverrouillage de la souris (`Alt`) lorsqu’on passe sur une œuvre était difficile à stabiliser, avec des comportements imprévisibles selon les interactions précédentes.

2. **Visuels et textures :**
    - Obtenir des textures jolies et cohérentes (sable, murs de la pyramide, piédestaux) a demandé des essais répétés pour ajuster les échelles (`uScale`, `vScale`) et les niveaux de bump mapping.

## Temps passé

- **Positionnement des artefacts :** Placer précisément chaque œuvre sur son piédestal (ajustement des offsets X/Y/Z et des échelles) a été très chronophage, surtout pour éviter les chevauchements ou les flottements.
- **Visite guidée :** Implémenter une transition ordonnée de l’œuvre 1 à 10 avec une animation fluide et un timer personnalisable a pris beaucoup de temps, notamment pour gérer les interruptions (retour manuel).

## Points à améliorer

- **Lag près des modèles 3D :** Lorsqu’on s’approche trop de certains artefacts (surtout les plus complexes), des ralentissements apparaissent. Optimiser les modèles ou réduire la qualité des textures pourrait aider.
- **Responsivité :** L’interface 2D (panneau d’info, minimap) n’est pas totalement adaptée aux petits écrans.

## Structure de l’archive

- `index.html` : Page principale.
- `css/style.css` : Styles du projet.
- `js/script.js` : Logique JavaScript et BabylonJS.
- `assets/` : Contient les textures (`sand_diffuse.jpg`, `wall_normal.jpg`, etc.) et modèles 3D (`oeuvre1.glb` à `oeuvre10.glb`, `pedestal.glb`).

## Remarques finales

Ce projet a été une exploration passionnante de la 3D interactive avec BabylonJS. Merci d’avance pour votre évaluation ! N’hésitez pas à tester toutes les fonctionnalités pour découvrir l’expérience complète.

* MARION Enzo & PIPET Jordan