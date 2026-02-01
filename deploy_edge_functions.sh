#!/bin/bash
# Deploy apenas das Edge Functions indicadas para o servidor (root@168.231.112.159)
# Não usa --delete: não remove arquivos já existentes no servidor (ex.: create-payment-intent, stripe-webhook).
# Variáveis de ambiente: não alteramos o que já existe; ver EDGE_FUNCTIONS_ENV.md para variáveis novas.
#
# Uso: ./deploy_edge_functions.sh
# Requer: ssh e rsync no PATH

set -e
SERVER="root@168.231.112.159"
# Caminho no servidor onde ficam as funções. TEM DE SER O MESMO nos 3 scripts (deploy, update_stripe_test, update_stripe_production).
# Se o teu stack (docker-compose) usa outro path, altera aqui e nos update_stripe_*.sh para esse path.
REMOTE_DIR="/root/supabase-project/volumes/functions"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/supabase/functions"

# Funções a fazer deploy (adicione ou remova conforme necessário). "main" é o router do edge-runtime e é enviado em separado.
FUNCTIONS="check-subscription create-subscription create-payment-intent manage-subscription match-services-ai send-email send-recovery-emails stripe-webhook track-checkout"
SHARED="_shared"
MAIN="main"

echo "📦 Deploy das Edge Functions (seletivo) para $SERVER"
echo "   Funções: $FUNCTIONS"
echo "   + $SHARED (compartilhado) + $MAIN (router)"
echo "   Local:   $LOCAL_DIR"
echo "   Remote:  $REMOTE_DIR"
echo "   (Não remove nada no servidor; apenas envia/atualiza estes diretórios.)"
echo ""

# Garantir diretórios no servidor
echo "📁 Criando diretórios remotos..."
ssh $SERVER "mkdir -p $REMOTE_DIR $REMOTE_DIR/_shared $REMOTE_DIR/main"
for f in $FUNCTIONS; do
  ssh $SERVER "mkdir -p $REMOTE_DIR/$f"
done

# Sincronizar main (router obrigatório: --main-service /home/deno/functions/main)
echo "🔄 Sincronizando main (router)..."
rsync -avz \
  "$LOCAL_DIR/main/" \
  "$SERVER:$REMOTE_DIR/main/" \
  --exclude '.DS_Store'

# Sincronizar _shared (todas as funções dependem)
echo "🔄 Sincronizando _shared..."
rsync -avz \
  "$LOCAL_DIR/_shared/" \
  "$SERVER:$REMOTE_DIR/_shared/" \
  --exclude '.DS_Store'

# Sincronizar cada função (sem --delete)
for f in $FUNCTIONS; do
  if [ -d "$LOCAL_DIR/$f" ]; then
    echo "🔄 Sincronizando $f..."
    rsync -avz \
      "$LOCAL_DIR/$f/" \
      "$SERVER:$REMOTE_DIR/$f/" \
      --exclude 'index-simple.ts' \
      --exclude '*.map' \
      --exclude '.DS_Store'
  else
    echo "⚠️  Pasta local $f não encontrada; ignorando."
  fi
done

echo ""
echo "✅ Arquivos enviados. Conteúdo remoto (apenas estas pastas):"
for f in $MAIN $SHARED $FUNCTIONS; do
  ssh $SERVER "ls -la $REMOTE_DIR/$f/ 2>/dev/null || true"
done

echo ""
echo "🔄 Reiniciando container supabase-edge-functions..."
ssh $SERVER "docker restart supabase-edge-functions 2>/dev/null || echo 'Container não encontrado; verifique com: docker ps -a'"

echo ""
echo "✨ Deploy concluído."
echo "   Variáveis novas (se ainda não tiver): veja EDGE_FUNCTIONS_ENV.md"
echo "   Logs: ssh $SERVER 'docker logs -f supabase-edge-functions'"
echo ""
