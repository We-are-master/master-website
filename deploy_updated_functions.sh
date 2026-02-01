#!/bin/bash
# Deploy apenas das Edge Functions atualizadas (webhook, payment, email, track-checkout, _shared).
# Keys já atualizadas manualmente; este script só envia código e reinicia o container.
#
# Uso: ./deploy_updated_functions.sh
# Requer: ssh e rsync no PATH

set -e
SERVER="root@168.231.112.159"
REMOTE_DIR="/root/supabase-project/volumes/functions"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/supabase/functions"

# Apenas as funções que foram atualizadas (sem main)
FUNCTIONS="stripe-webhook create-payment-intent send-email track-checkout"
SHARED="_shared"

echo "📦 Deploy apenas das funções atualizadas para $SERVER"
echo "   Funções: $FUNCTIONS"
echo "   + $SHARED (compartilhado)"
echo "   Local:   $LOCAL_DIR"
echo "   Remote:  $REMOTE_DIR"
echo ""

# Garantir diretórios no servidor
ssh $SERVER "mkdir -p $REMOTE_DIR/$SHARED"
for f in $FUNCTIONS; do
  ssh $SERVER "mkdir -p $REMOTE_DIR/$f"
done

# Sincronizar _shared (todas dependem)
echo "🔄 Sincronizando _shared..."
rsync -avz \
  "$LOCAL_DIR/_shared/" \
  "$SERVER:$REMOTE_DIR/_shared/" \
  --exclude '.DS_Store'

# Sincronizar cada função
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
echo "🔄 Reiniciando container supabase-edge-functions..."
ssh $SERVER "docker restart supabase-edge-functions 2>/dev/null || echo 'Container não encontrado; verifique com: docker ps -a'"

echo ""
echo "✨ Deploy concluído (apenas funções atualizadas)."
echo "   Logs: ssh $SERVER 'docker logs -f supabase-edge-functions'"
echo ""
