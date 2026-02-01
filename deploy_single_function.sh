#!/bin/bash
# Deploy de UMA Edge Function para o servidor (main + _shared + função indicada).
# Uso: ./deploy_single_function.sh <nome-da-função>
# Ex.: ./deploy_single_function.sh stripe-webhook
# Requer: ssh e rsync no PATH

set -e
SERVER="root@168.231.112.159"
REMOTE_DIR="/root/supabase-project/volumes/functions"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/supabase/functions"

FUNCTION_NAME="${1:-}"
if [ -z "$FUNCTION_NAME" ]; then
  echo "Uso: $0 <nome-da-função>"
  echo ""
  echo "Exemplos:"
  echo "  $0 stripe-webhook"
  echo "  $0 send-email"
  echo "  $0 create-payment-intent"
  echo ""
  echo "Funções disponíveis:"
  ls -1 "$LOCAL_DIR" 2>/dev/null | grep -v '^_shared$' | grep -v '^main$' | sed 's/^/  - /'
  exit 1
fi

if [ ! -d "$LOCAL_DIR/$FUNCTION_NAME" ]; then
  echo "❌ Pasta local não encontrada: $LOCAL_DIR/$FUNCTION_NAME"
  exit 1
fi

echo "📦 Deploy de uma função: $FUNCTION_NAME"
echo "   Local:  $LOCAL_DIR"
echo "   Remote: $SERVER:$REMOTE_DIR"
echo "   (main + _shared + $FUNCTION_NAME)"
echo ""

echo "📁 Criando diretórios remotos..."
ssh $SERVER "mkdir -p $REMOTE_DIR $REMOTE_DIR/_shared $REMOTE_DIR/main $REMOTE_DIR/$FUNCTION_NAME"

echo "🔄 Sincronizando main (router)..."
rsync -avz \
  "$LOCAL_DIR/main/" \
  "$SERVER:$REMOTE_DIR/main/" \
  --exclude '.DS_Store'

echo "🔄 Sincronizando _shared..."
rsync -avz \
  "$LOCAL_DIR/_shared/" \
  "$SERVER:$REMOTE_DIR/_shared/" \
  --exclude '.DS_Store'

echo "🔄 Sincronizando $FUNCTION_NAME..."
rsync -avz \
  "$LOCAL_DIR/$FUNCTION_NAME/" \
  "$SERVER:$REMOTE_DIR/$FUNCTION_NAME/" \
  --exclude 'index-simple.ts' \
  --exclude '*.map' \
  --exclude '.DS_Store'

echo ""
echo "🔄 Reiniciando container supabase-edge-functions..."
ssh $SERVER "docker restart supabase-edge-functions 2>/dev/null || echo 'Container não encontrado; verifique com: docker ps -a'"

echo ""
echo "✨ Deploy concluído: $FUNCTION_NAME (+ main e _shared)."
echo "   Logs: ssh $SERVER 'docker logs -f supabase-edge-functions'"
echo ""
