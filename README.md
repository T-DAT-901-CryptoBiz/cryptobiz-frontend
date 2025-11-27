# 🚀 CryptoBiz

[![Nuxt 4](https://img.shields.io/badge/Nuxt-4.0-00DC82?logo=nuxt.js)](https://nuxt.com)
[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vue.js)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

Une application web moderne de suivi et d'analyse de cryptomonnaies, construite avec Nuxt 4, Vue 3 et TypeScript.

![CryptoBiz Dashboard](public/cryptobiz-logo.png)

## ✨ Fonctionnalités

### 📊 Dashboard & Marchés
- **Tableau de bord temps réel** avec prix, volumes et variations 24h
- **Graphiques interactifs** (candlesticks, sparklines) via ApexCharts
- **Heatmap** de performance du marché
- **Top Gainers/Losers** et alertes de volume

### 📈 Analyse d'actifs
- **Page détaillée par actif** (`/asset/[symbol]`)
- **Order Book** et trades récents en temps réel
- **Comparaison multi-actifs** (`/compare`)
- **Convertisseur de cryptos** (`/convert`)

### 🔔 Alertes & Portfolio
- **Alertes de prix** personnalisables (au-dessus, en-dessous, variation %)
- **Gestion de portfolio** avec suivi des transactions
- **Watchlist** pour suivre vos cryptos favorites

### 📰 Actualités
- **Flux d'actualités** agrégé depuis plusieurs sources
- **Filtrage par catégorie** et recherche
- **Favoris** et articles non lus

### 👤 Authentification
- **Connexion locale** (email/mot de passe)
- **OAuth Google** pour une connexion rapide
- **Panneau d'administration** pour les utilisateurs admin

## 🛠️ Stack Technique

| Catégorie | Technologies |
|-----------|-------------|
| **Framework** | Nuxt 4, Vue 3, TypeScript |
| **UI** | Nuxt UI, TailwindCSS, Lucide Icons |
| **Graphiques** | ApexCharts (vue3-apexcharts) |
| **APIs** | Binance Spot & Futures, API Klines personnalisée |
| **Auth** | Google OAuth, bcryptjs |
| **Qualité** | ESLint, Prettier, Husky, Commitlint |

## 📦 Installation

### Prérequis

- Node.js 18+ 
- npm, pnpm, yarn ou bun
- Backend API Klines (optionnel, sur le port 8004)

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/cryptobiz-frontend.git
cd cryptobiz-frontend
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer l'environnement

```bash
cp .env.example .env
```

Édite le fichier `.env` selon ton environnement :

```env
# API Klines / Articles (backend Python)
KLINE_API_URL=http://127.0.0.1:8004
NUXT_PUBLIC_KLINE_API_URL=http://127.0.0.1:8004
NUXT_PUBLIC_KLINE_WS_URL=ws://127.0.0.1:8004

# Binance APIs (optionnel - valeurs par défaut)
NUXT_PUBLIC_BINANCE_REST_BASE=https://api.binance.com
NUXT_PUBLIC_BINANCE_WS_BASE=wss://stream.binance.com:9443/ws
NUXT_PUBLIC_BINANCE_FUTURES_REST_BASE=https://fapi.binance.com

# Google OAuth (voir AUTH_SETUP.md)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000)

## 🚀 Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Démarre le serveur de développement |
| `npm run build` | Build pour la production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run lint:fix` | Corrige automatiquement les erreurs ESLint |
| `npm run typecheck` | Vérifie les types TypeScript |

## 📁 Structure du projet

```
cryptobiz-frontend/
├── app/
│   ├── components/       # Composants Vue réutilisables
│   │   ├── Charts/       # Graphiques (Donut, Sparkline, Klines...)
│   │   ├── Dashboard/    # Widgets du dashboard
│   │   ├── Market/       # Composants marché (OrderBook, Trades...)
│   │   ├── news/         # Composants actualités
│   │   └── ui/           # Composants UI génériques
│   ├── composables/      # Logique réutilisable (useAuth, useKlines...)
│   ├── layouts/          # Layouts de page
│   ├── middleware/       # Middleware d'authentification
│   ├── pages/            # Routes de l'application
│   ├── plugins/          # Plugins Nuxt
│   └── types/            # Types TypeScript
├── server/
│   ├── api/              # Routes API (auth, alerts, portfolio...)
│   ├── plugins/          # Plugins serveur
│   └── utils/            # Utilitaires serveur
├── public/               # Assets statiques
├── nuxt.config.ts        # Configuration Nuxt
└── .env.example          # Template des variables d'environnement
```

## 🔐 Authentification Google OAuth

Pour configurer Google OAuth, consulte le fichier [AUTH_SETUP.md](AUTH_SETUP.md) pour les instructions détaillées.

En résumé :
1. Crée un projet sur [Google Cloud Console](https://console.cloud.google.com/)
2. Active l'API Google+ ou Google Identity
3. Crée des identifiants OAuth 2.0
4. Ajoute `http://localhost:3000/api/auth/google` dans les URIs de redirection
5. Copie le Client ID et Secret dans ton `.env`

## 🐳 Docker

```bash
# Build l'image
docker build -t cryptobiz-frontend .

# Lance le conteneur
docker-compose up -d
```

## 📄 Licence

Ce projet est sous licence privée. Tous droits réservés.

## 🤝 Contribution

1. Fork le projet
2. Crée une branche (`git checkout -b feature/amazing-feature`)
3. Commit tes changements (`git commit -m 'feat: add amazing feature'`)
4. Push sur la branche (`git push origin feature/amazing-feature`)
5. Ouvre une Pull Request

---

Développé avec ❤️ par l'équipe CryptoBiz
