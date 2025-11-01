# Configuration de l'authentification

## Installation

Les dépendances nécessaires ont été installées :
- `bcryptjs` : pour le hachage des mots de passe
- `google-auth-library` : pour l'OAuth Google

## Configuration Google OAuth

### Étape 1 : Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquez sur le sélecteur de projet en haut à gauche
3. Cliquez sur "Nouveau projet"
4. Donnez un nom à votre projet (ex: "CryptoBiz Auth")
5. Cliquez sur "Créer"

### Étape 2 : Activer l'API

1. Dans le menu latéral, allez dans "APIs & Services" > "Library"
2. Cherchez "Google+ API" ou "Google Identity API"
3. Cliquez sur "Enable" pour l'activer

### Étape 3 : Créer les identifiants OAuth 2.0

1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "+ CREATE CREDENTIALS" en haut
3. Sélectionnez "OAuth client ID"
4. Si c'est la première fois, configurez l'écran de consentement OAuth :
   - Type d'utilisateur : External (ou Internal si vous avez Google Workspace)
   - Nom de l'application : CryptoBiz
   - Email de support utilisateur : votre email
   - Scopes : pas besoin de les ajouter pour l'instant
   - Utilisateurs de test : ajoutez votre email Google si nécessaire
5. Créez l'OAuth Client ID :
   - Type d'application : **Web application**
   - Nom : CryptoBiz Local (ou autre nom)
   - **URI de redirection autorisés** : 
     - `http://localhost:3000/api/auth/google` (pour le développement)
     - Pour la production, ajoutez aussi : `https://votre-domaine.com/api/auth/google`
6. Cliquez sur "Create"
7. **Copiez le Client ID et le Client Secret** qui s'affichent

### Étape 4 : Configurer le fichier .env

1. Créez un fichier `.env` à la racine du projet (copiez `.env.example`)
2. Ajoutez vos identifiants :

```env
GOOGLE_CLIENT_ID=votre-client-id-complet.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre-client-secret-complet
```

3. **Redémarrez le serveur** pour que les variables d'environnement soient chargées

### Étape 5 : Tester

1. Redémarrez le serveur : `npm run dev`
2. Allez sur `/login`
3. Cliquez sur le bouton "Google"
4. Vous devriez être redirigé vers la page de connexion Google

## Structure

### Routes API

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Obtenir l'utilisateur actuel
- `GET /api/auth/google` - OAuth Google

### Pages

- `/login` - Page de connexion
- `/register` - Page d'inscription

### Composable

Utilisez `useAuth()` dans vos composants :

```typescript
const { user, isAuthenticated, login, register, logout, loginWithGoogle } = useAuth()
```

### Middleware

Le middleware `auth.ts` protège automatiquement les routes avec `meta.requiresAuth: true`.

### Stockage

Les utilisateurs sont stockés dans `.data/users.json` (créé automatiquement).

## Utilisation

1. Démarrer le serveur : `npm run dev`
2. Accéder à `/register` pour créer un compte
3. Ou utiliser le bouton Google pour se connecter avec OAuth

