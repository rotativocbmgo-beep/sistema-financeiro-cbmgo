# CBMGO-FINANCEIRO

## Backend (API)
```bash
cd api
cp .env.example .env
npm install
npm run dev   # http://localhost:3333/health
```

Frontend (Web)
cd web
npm install
# Configure a URL da API:
# No Linux/Mac: echo "VITE_API_URL=http://localhost:3333/api" > .env
# No Windows (PowerShell): echo VITE_API_URL=http://localhost:3333/api > .env
npm run dev   # http://localhost:5173

Deploy (opcional)

Render: crie um serviço Web e pegue o Deploy Hook. Configure RENDER_DEPLOY_HOOK como secret no GitHub.

Vercel: configure VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID como secrets no GitHub.
