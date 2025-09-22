# 🚀 Guide de Déploiement MindMap App

## 📋 Vos Domaines
- **Frontend Vercel**: `mindmap-app-eosin.vercel.app`
- **Backend Railway**: `mindmap-app-production-ebf3.up.railway.app`
- **Deployment**: `mindmap-mpi22af87-matteos-projects-aec0e9b8.vercel.app`

## 🔧 Configuration Étape par Étape

### 1. Configuration Vercel (Frontend) ✅

Dans votre dashboard Vercel (https://vercel.com/dashboard):

1. **Sélectionnez votre projet `mindmap-app`**
2. **Allez dans Settings > Environment Variables**
3. **Ajoutez ces variables**:
   ```
   Name: VITE_API_URL
   Value: https://mindmap-app-production-ebf3.up.railway.app
   ```

### 2. Configuration Railway (Backend) 🚄

Dans votre dashboard Railway (https://railway.app/dashboard):

1. **Créez un nouveau projet**
2. **Connectez votre repo GitHub**
3. **Sélectionnez le dossier `server`** comme Root Directory
4. **Ajoutez une base de données PostgreSQL**
5. **Configurez ces variables d'environnement**:

   ```bash
   # Copiez l'URL de votre base PostgreSQL Railway
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   
   # Générez un secret JWT sécurisé
   JWT_SECRET=mindmap_super_secret_key_2024_secure_random_string
   
   # URL de votre frontend Vercel
   CLIENT_URL=https://mindmap-app-eosin.vercel.app
   
   # Configuration production
   NODE_ENV=production
   PORT=5000
   ```

6. **Redéployez** après avoir pushé les corrections Dockerfile

> 💡 **Note importante** : Le Dockerfile a été corrigé pour inclure les types TypeScript pendant la compilation, résolvant les erreurs de build.

### 3. Commandes de Déploiement 

**Redéployer Vercel:**
```bash
cd client
vercel --prod
```

**Redéployer Railway:**
```bash
# Railway redéploie automatiquement sur git push
git add .
git commit -m "Configure production deployment"
git push origin main
```

## 🔗 URLs de Test

Une fois configuré, testez ces URLs:

- **Frontend**: https://mindmap-app-eosin.vercel.app
- **API Health**: https://[votre-railway-app].railway.app/health
- **API Docs**: https://[votre-railway-app].railway.app/api

## 🛠️ Dépannage

### Erreurs communes:

1. **CORS Error**: Vérifiez CLIENT_URL dans Railway
2. **Database Error**: Vérifiez DATABASE_URL dans Railway  
3. **Build Error**: Vérifiez les logs dans les dashboards

### Logs utiles:
- **Vercel**: Dashboard > Functions > View Function Logs
- **Railway**: Dashboard > Deployments > View Logs

## 📞 Besoin d'aide?

Si vous rencontrez des problèmes, partagez:
1. URL de votre app Railway
2. Messages d'erreur des logs
3. Captures d'écran des dashboards