# 🐙 Octopus Bot — Deploy no Railway

## Passo a passo para subir no Railway

### 1. Crie um repositório no GitHub
- Acesse github.com
- Clique em "New repository"
- Nome: octopus-bot
- Clique em "Create repository"

### 2. Suba os arquivos
- Clique em "uploading an existing file"
- Arraste os arquivos index.js e package.json
- Clique em "Commit changes"

### 3. Deploy no Railway
- Acesse railway.app
- Clique em "New Project"
- Escolha "Deploy from GitHub repo"
- Selecione o repositório octopus-bot

### 4. Configure as variáveis de ambiente
No Railway, vá em Variables e adicione:

BOT_TOKEN = seu_token_do_botfather
SUPABASE_URL = https://ynwabcifivrtponphyno.supabase.co
SUPABASE_KEY = sua_anon_key

### 5. Deploy automático
O Railway vai detectar o package.json e rodar automaticamente.
Aguarde o deploy — leva cerca de 2 minutos.

### 6. Teste
Abra o Telegram, procure seu bot e mande /start
