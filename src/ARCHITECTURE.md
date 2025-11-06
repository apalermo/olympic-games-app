# Documentation d'Architecture - Projet Télésport

Ce document décrit l'architecture front-end de l'application Télésport (Jeux Olympiques), refactorisée pour améliorer la maintenabilité, la lisibilité et la performance, tout en préparant l'intégration future d'une API.

## 1. Principes d'Architecture

L'application repose sur trois principes fondamentaux d'Angular :

1. **Séparation des Responsabilités (SoC) :** Le code est divisé par fonctionnalité (pages, composants réutilisables, services, modèles).

2. **Pattern "Smart/Dumb Components" :**

   - **Pages (Smart) :** Des composants "intelligents" qui gèrent la logique d'une page (ex: `DashboardComponent`). Ils s'abonnent aux services pour récupérer les données.

   - **Components (Dumb) :** Des composants "stupides" (de présentation) réutilisables (ex: `HeaderComponent`, `MedalChartComponent`). Ils se contentent d'afficher les données reçues via la fonction `input()`.

3. **Pattern "Singleton" pour les Services :**

   - La logique métier et l'accès aux données sont centralisés dans des services injectables (`providedIn: 'root'`), garantissant une source de vérité unique.

## 2. Arborescence des Dossiers

Voici l'arborescence de dossiers proposée pour `src/app/` :

- **src/app/**
  - **components/** (Composants "Dumb" réutilisables)
    - **header/**
    - **medal-chart/**
    - **country-card/**
  - **pages/** (Composants "Smart" / Conteneurs de pages)
    - **dashboard/**
    - **detail/**
    - **not-found/**
  - **services/** (Logique métier et accès aux données)
    - `data.service.ts`
  - **models/** (Interfaces TypeScript pour le typage)
    - `Olympic.model.ts`
    - `Participation.model.ts`
    - `KPI.model.ts`
  - `app-routing.module.ts`
  - `app.component.ts` (Coquille de l'application)
  - `app.module.ts`

## 3. Rôles des Composants

### Pages (`pages/`)

- **`DashboardComponent` :** Affiche la vue d'ensemble (Dashboard). Appelle le `DataService` pour obtenir les données de tous les pays, calcule les KPI et les transmet aux composants enfants (`HeaderComponent`, `MedalChartComponent`).

- **`DetailComponent` :** Affiche la vue détaillée d'un pays. Récupère l'`:id` de l'URL, appelle le `DataService` pour obtenir les données spécifiques à ce pays, et les transmet aux composants enfants (`HeaderComponent`, `CountryCardComponent`).

- **`NotFoundComponent` :** Affiche un message d'erreur si la route n'existe pas.

### Composants Réutilisables (`components/`)

- **`HeaderComponent` :** Composant "Dumb" qui affiche un titre et une liste de KPI. Reçoit le titre et un tableau de `KPI[]` via `input()`.

- **`MedalChartComponent` (Pie Chart) :** Composant "Dumb" qui affiche le Pie Chart. Reçoit les données (`countries`, `medals`, `ids`) via `input()` et gère la logique de navigation `onClick`.

- **`CountryCardComponent` (Line Chart) :** Composant "Dumb" qui affiche le Line Chart. Reçoit les données (`years`, `medals`) via `input()`.

## 4. Rôle du Service

### `DataService` (`services/data.service.ts`)

Le `DataService` centralise toute la logique de récupération et transformation des données. C'est le seul module autorisé à intéragir avec la source de données.

- **Singleton :** Il est `providedIn: 'root'`, garantissant une seule instance.

- **Centralisation :** Il est le **seul** à contenir le `HttpClient` et l'URL de l'API (actuellement `olympic.json`).

- **Transformation :** Il ne se contente pas de retourner les données brutes. Il contient des méthodes "intelligentes" (ex: `getDashboardData`, `getDetailData`) qui utilisent les opérateurs RxJS (`map`, `switchMap`) pour **transformer** les données (`Olympic[]`) en objets "propres" (`DetailData`) dont les composants ont besoin.

- **Performance :** Il utilise `shareReplay(1)` pour mettre en cache le premier appel HTTP, évitant des requêtes réseau inutiles lors de la navigation.

### Préparation à une future API (Back-End)

Cette architecture est conçue pour l'évolutivité. Pour passer du fichier `olympic.json` à une véritable API REST :

1. **Seul le `DataService` sera modifié.** Il suffira de changer l'URL (`this.olympicUrl`) pour pointer vers l'API (ex: `/api/v1/olympics`).

2. **Aucun composant** (`Dashboard`, `Detail`, etc.) ne sera impacté, car ils dépendent que des _méthodes_ du service (`getDetailData`), pas de sa _source_ de données.

## 5. Flux de Données (Exemple : Page Détail)

1.  L'utilisateur navigue vers `/country/1`.

2.  Le `Router` active le `DetailComponent`.

3.  Le `DetailComponent` (`ngOnInit`) s'abonne à `this.route.paramMap`.

4.  L'opérateur `switchMap` reçoit l'ID (`1`) et appelle `this.dataService.getDetailData(1)`.

5.  Le `DataService` utilise son cache (`shareReplay`), prend les données, exécute la logique `map()` pour trouver et transformer le pays 1.

6.  Le `DataService` retourne un objet `DetailData` propre.

7.  Le `DetailComponent` reçoit cet objet dans son `subscribe({ next: (data) => ... })`.

8.  Il met à jour ses propriétés locales (ex: `this.titlePage = data.title`).

9.  Le template HTML se met à jour, passant les données aux composants enfants (`<app-header [title]="titlePage">`).

10. Les `effect()` dans les composants graphiques voient les `input()` (signaux) changer et dessinent les graphiques.
