# Audit d'architecture - Application TéléSport

Ce document recense les problèmes d'architecture, les anti-patterns et les risques de dette technique identifiés dans le code de démarrage du projet.

---

## 1. Anti-Patterns et Problèmes d'Architecture

Cette section couvre les problèmes majeurs qui violent les principes de conception d'Angular.

### Appel HTTP directement dans les composants

- **Constat :** Les composants `country.component.ts` et `home.component.ts` gèrent directement la logique de récupération des données.
- **Impact (Anti-pattern "Fat Component") :**
  - **Violation du SRP (Single Responsibility Principle) :** Un composant doit se concentrer sur l'affichage et la gestion des interactions utilisateur, pas sur la récupération de données.
  - **Non réutilisable :** Cette logique ne peut pas être partagée avec d'autres composants.
  - **Difficile à tester :** Il est très difficile de tester un composant qui effectue des appels HTTP.
- **Solution suggérée :** Déplacer toute la logique de données dans un service (`DataService`) injecté en `providedIn: 'root'`.

### Absence d'une couche de service

- **Constat :** Il n'existe aucun service dédié à la gestion des données (`DataService` est manquant).
- **Impact :** Cela force les composants à adopter l'anti-pattern décrit ci-dessus.

---

## 2. Problèmes de Structure de Projet

Cette section concerne l'organisation des fichiers et des dossiers.

### Absence d'un dossier `models` et d'interfaces

- **Constat :** Les structures de données comme `Participation` et `Olympic` ne sont pas définies dans des interfaces. Il n'y a pas de dossier `src/app/models` pour les centraliser.
- **Impact :**
  - **Manque de typage strict :** Conduit à l'utilisation de `any` (voir point suivant).
  - **Manque de clarté :** Le format des données n'est pas clair, ce qui complique le développement et la maintenance.

### Absence d'un `HeaderComponent`

- **Constat :** Le header n'est pas un composant dédié.
- **Impact :** Si le header est dupliqué dans `app.component.html` ou d'autres pages, cela crée de la duplication de code. S'il doit devenir plus complexe (ex: ajouter un menu), il sera difficile à maintenir.

---

## 3. Problèmes de Qualité de Code (Dette technique)

Cette section couvre les problèmes de lisibilité et les "code smells" qui dégradent la qualité.

### Utilisation abusive du type `any`

- **Constat :** Le type `any` est utilisé à plusieurs reprises (par exemple, pour les données des graphiques).
- **Impact :** Cela désactive la vérification de type de TypeScript, ce qui annule l'un des principaux avantages d'Angular. Le risque d'erreurs à l'exécution (ex: `cannot read property 'name' of undefined`) est très élevé.

### Conversions de type inutiles

- **Constat :** Par exemple dans `country.component.ts`, le `medalsCount` (un `number`) est converti en `string` (`.toString()`) lors du `map`, pour être ensuite re-converti en `number` (`parseInt()`) lors du `reduce` pour calculer le total.
- **Impact :** Code inefficace (coût de conversions inutiles), illisible, et force l'utilisation d'un type `string` ou `any` dans le `reduce`, ce qui nuit à la robustesse du code.
- **Solution suggérée :** Supprimer la conversion `.toString()` et effectuer le `reduce` directement sur le `number[]`.

### Noms de variables confus

- **Constat :** Les noms de variables sont souvent peu clairs ou réutilisés dans des contextes différents (ex: `i` utilisé pour un `Olympic` puis pour un `number[]` dans `home.component.ts`).
- **Impact :** Rend le code très difficile à lire, à comprendre et à déboguer. C'est une source directe de confusion pour le typage.

### Duplication de logique métier (Non DRY)

- **Constat :** Les fonctions `buildChart()` (dans `home.component.ts`) et `buildPieChart()` (dans `country.component.ts`) sont très similaires.
- **Impact :** Violation du principe **DRY (Don't Repeat Yourself)**. Si la logique de création des graphiques doit changer, il faudra la modifier à deux endroits, avec un risque d'oubli et d'incohérence.
- **Solution suggérée :** Créer un service (ex: `ChartService`) pour centraliser cette logique.

### Injection inutile du `Router`

- **Constat :** `country.component.ts` injecte `Router` dans son constructeur mais ne l'utilise nulle part.
- **Impact :** Code mort. Cela alourdit le composant inutilement et peut prêter à confusion pour le prochain développeur.

### Utilisation de `console.log`

- **Constat :** Un `console.log` est présent dans `home.component.ts`.
- **Impact :** Code de débuggage qui ne doit jamais être commité. Cela pollue la console en production.

### Syntaxe de `subscribe` dépréciée

- **Constat :** Les abonnements aux Observables utilisent des callbacks séparés (`subscribe(data => ..., error => ...)`).
- **Impact :** C'est une pratique dépréciée. La syntaxe moderne utilise un objet `Observer` (`subscribe({ next: ..., error: ..., complete: ... })`), qui est plus lisible.

### Typage explicite redondant

- **Constat :** Plusieurs variables sont typées explicitement alors qu'elles sont initialisées avec une valeur permettant l'inférence de type (ex: `variable: string = ''`).
- **Impact :** Cela rend le code plus verbeux et redondant, allant à l'encontre des conventions modernes de TypeScript.
- **Solution suggérée :** Se reposer sur l'inférence de type pour les variables initialisées (ex: `variable = ''`).

---

## 4. Non-conformité avec le Cahier des Charges

### Nommage des composants de page

- **Constat :** Les composants racines des routes sont nommés `home` et `country` alors qu'il sont nommés `dashboard` et `detail` .
- **Impact :** Cela rendre le développment confus.

### Paramètre de route incorrect

- **Constat :** Le routing vers une page pays utilise le nom du pays comme paramètre d'URL (`/country/:countryName`).
- **Impact :** Le cahier des charges demande un `id`. L'utilisation d'un nom est peu recommandée (problèmes avec les espaces ou les caractères spéciaux).

# Proposition de Nouvelle Architecture - Application TéléSport

Sur la base de l'audit initial, voici la proposition d'une nouvelle structure de dossiers pour améliorer la maintenabilité, la lisibilité et l'évolutivité du projet, tout en se préparant à une future intégration d'API.

---

## A. Principes et Design Patterns

La nouvelle architecture s'articulera autour de trois principes fondamentaux :

1.  **Séparation des Responsabilités (SoC) :** Le code sera divisé par fonctionnalité (pages, composants réutilisables, services, modèles).
2.  **Pattern "Smart/Dumb Components" :**
    - **`pages/` (Smart) :** Composants (conteneurs) qui gèrent la logique d'une page. Ils s'abonnent aux services pour récupérer et envoyer des données.
    - **`components/` (Dumb) :** Composants (de présentation) réutilisables. Ils se contentent d'afficher les données reçues via `input()` et d'émettre des événements via `output()`. Ils n'ont pas connaissance des services.
3.  **Pattern "Singleton" pour les Services :**
    - **`services/` :** Toute la logique métier et l'accès aux données seront centralisés ici. En utilisant `providedIn: 'root'`, chaque service sera un Singleton (une seule instance pour toute l'application), garantissant une source de vérité unique.

## B. Arborescence Cible

Voici l'arborescence de dossiers proposée pour `src/app/` :

- **src/app/**
  - **components/**
    - **header/**
      - `header.component.html`
      - `header.component.scss`
      - `header.component.ts`
    - **medal-chart/**
      - `medal-chart.component.html`
      - `medal-chart.component.scss`
      - `medal-chart.component.ts`
    - **country-card/**
      - `country-card.component.html`
      - `country-card.component.scss`
      - `country-card.component.ts`
  - **pages/**
    - **dashboard/**
      - `dashboard.component.html`
      - `dashboard.component.scss`
      - `dashboard.component.ts`
    - **detail/**
      - `detail.component.html`
      - `detail.component.scss`
      - `detail.component.ts`
    - **not-found/**
      - `not-found.component.html`
      - `not-found.component.scss`
      - `not-found.component.ts`
  - **services/**
    - `data.service.ts` (Gérera les appels API)
  - **models/**
    - `Olympic.model.ts` (Interface pour un objet Olympic + ses participations)
    - `Participation.model.ts` (Interface pour un objet Participation)
  - `app-routing.module.ts`
  - `app.component.html`
  - `app.component.scss`
  - `app.component.ts`
  - `app.module.ts`

## C. Justification et Préparation à l'API

Cette structure résout les problèmes de l'audit initial :

- **Anti-patterns résolus :** Les appels HTTP seront retirés des composants et placés dans `data.service.ts`.
- **Qualité du code :** Le typage `any` sera remplacé par les interfaces de `models/`.
- **DRY (Don't Repeat Yourself) :** La logique des graphiques sera centralisée dans `chart.service.ts`.
- **Lisibilité :** La structure de dossiers est claire et suit les conventions Angular.
- **Préparation à l'API :** L'intégration d'un back-end réel devient simple. Il suffira de modifier le service `data.service.ts` pour remplacer les données "mockées" par de réels appels `HttpClient`. Aucun composant ne sera impacté par ce changement, car ils dépendent du service, et non de la source des données.
