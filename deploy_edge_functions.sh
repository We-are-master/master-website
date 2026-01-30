#!/bin/bash
# Deploy apenas das Edge Functions indicadas para o servidor (root@168.231.112.159)
# Não usa --delete: não remove arquivos já existentes no servidor (ex.: create-payment-intent, stripe-webhook).
# Variáveis de ambiente: não alteramos o que já existe; ver EDGE_FUNCTIONS_ENV.md para variáveis novas.
#
# Uso: ./deploy_edge_functions.sh
# Requer: ssh e rsync no PATH

set -e
SERVER="root@168.231.112.159"
REMOTE_DIR="/root/supabase/functions"
LOCAL_DIR="$(cd "$(dirname "$0")" && pwd)/supabase/functions"

# Apenas estas funções (create-subscription e manage-subscription já existem no app; estamos atualizando com a versão website)
FUNCTIONS="check-subscription create-subscription manage-subscription send-email send-recovery-emails track-checkout"
SHARED="_shared"

echo "📦 Deploy das Edge Functions (seletivo) para $SERVER"
echo "   Funções: $FUNCTIONS"
echo "   + $SHARED (compartilhado)"
echo "   Local:   $LOCAL_DIR"
echo "   Remote:  $REMOTE_DIR"
echo "   (Não remove nada no servidor; apenas envia/atualiza estes diretórios.)"
echo ""

# Garantir diretórios no servidor
echo "📁 Criando diretórios remotos..."
ssh $SERVER "mkdir -p $REMOTE_DIR $REMOTE_DIR/_shared"
for f in $FUNCTIONS; do
  ssh $SERVER "mkdir -p $REMOTE_DIR/$f"
done

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
for f in $SHARED $FUNCTIONS; do
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
