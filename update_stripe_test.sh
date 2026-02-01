#!/bin/bash

# Atualiza APENAS as chaves do Stripe para modo TESTE. Mantém todas as outras env vars do container.
# Por agora estamos a usar este modo (webhook de teste). Para produção: ./update_stripe_production.sh
# Uso: ./update_stripe_test.sh

# Stripe Test keys: não commitar valores reais. Usar read -p ou variáveis de ambiente.
read -p "STRIPE_SECRET_KEY de teste (sk_test_... do Stripe Dashboard): " STRIPE_SECRET_KEY
if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ STRIPE_SECRET_KEY é obrigatório."
  exit 1
fi
# Obrigatório: usar o Signing secret do endpoint de TEST no Stripe (Developers → Webhooks → o endpoint → Reveal).
read -p "STRIPE_WEBHOOK_SECRET de teste (whsec_... do Stripe Dashboard → Webhooks → Reveal): " STRIPE_WEBHOOK_SECRET
if [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
  echo "❌ STRIPE_WEBHOOK_SECRET é obrigatório para o webhook funcionar."
  exit 1
fi

# Master Club: necessário para o webhook criar assinatura quando add_subscription=true
read -p "STRIPE_MASTER_CLUB_PRICE_ID (price_... do Stripe Products, Enter para manter atual): " STRIPE_MASTER_CLUB_PRICE_ID

# Resend: necessário para send-email (confirmação de compra, etc.). Chave em https://resend.com/api-keys
read -p "RESEND_API_KEY (re_... para emails, Enter para manter atual): " RESEND_API_KEY

# OpenAI: necessário para match-services-ai (busca de serviços por texto). Chave em https://platform.openai.com/api-keys
read -p "OPENAI_API_KEY (sk-... para match-services-ai, Enter para manter atual): " OPENAI_API_KEY

echo ""
echo "🔧 Atualizando env do container (Stripe + opcionais: STRIPE_MASTER_CLUB_PRICE_ID, RESEND_API_KEY, OPENAI_API_KEY)..."
echo ""

# Path das funções no servidor - TEM DE SER O MESMO que REMOTE_DIR no deploy_edge_functions.sh
FUNCTIONS_VOLUME="/root/supabase-project/volumes/functions"

# No servidor: obter env do container atual ANTES de parar, atualizar só as duas chaves, recriar com --env-file
ssh root@168.231.112.159 "set -e
  CONTAINER=supabase-edge-functions
  FUNCTIONS_VOLUME=$FUNCTIONS_VOLUME
  ENV_FILE=/tmp/edge-env-\$\$
  if docker ps -a -q -f name=^\${CONTAINER}\$ 2>/dev/null | grep -q .; then
    echo '📋 Copiando env do container atual (só Stripe será alterado)...'
    docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' \$CONTAINER 2>/dev/null | grep -v '^STRIPE_SECRET_KEY=' | grep -v '^STRIPE_WEBHOOK_SECRET=' | grep -v '^STRIPE_MASTER_CLUB_PRICE_ID=' | grep -v '^RESEND_API_KEY=' | grep -v '^OPENAI_API_KEY=' > \"\$ENV_FILE\" || true
  else
    echo '⚠️  Container não existe; criando env mínimo (SUPABASE_*, etc.) + suas chaves Stripe.'
    cat > \"\$ENV_FILE\" << 'ENVFALLBACK'
SUPABASE_URL=https://supabase.wearemaster.com
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE
SUPABASE_DB_URL=postgresql://postgres:Master2025!!@db:5432/postgres
VERIFY_JWT=false
ENVFALLBACK
  fi
  echo \"STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY\" >> \"\$ENV_FILE\"
  echo \"STRIPE_WEBHOOK_SECRET=${STRIPE_WEBHOOK_SECRET:-}\" >> \"\$ENV_FILE\"
  [ -n \"$STRIPE_MASTER_CLUB_PRICE_ID\" ] && echo \"STRIPE_MASTER_CLUB_PRICE_ID=$STRIPE_MASTER_CLUB_PRICE_ID\" >> \"\$ENV_FILE\"
  [ -n \"$RESEND_API_KEY\" ] && echo \"RESEND_API_KEY=$RESEND_API_KEY\" >> \"\$ENV_FILE\"
  [ -n \"$OPENAI_API_KEY\" ] && echo \"OPENAI_API_KEY=$OPENAI_API_KEY\" >> \"\$ENV_FILE\"
  echo '📦 Parando e removendo container...'
  docker stop \$CONTAINER 2>/dev/null || true
  docker rm \$CONTAINER 2>/dev/null || true
  echo '🚀 Recriando com env atualizado (só Stripe mudou)...'
  docker run -d \
    --name \$CONTAINER \
    --network supabase_default \
    --env-file \"\$ENV_FILE\" \
    -v \$FUNCTIONS_VOLUME:/home/deno/functions \
    supabase/edge-runtime:v1.45.2 start --main-service /home/deno/functions/main
  rm -f \"\$ENV_FILE\"
  echo '✅ Feito.'
  docker ps | grep edge || true
"

echo ""
echo "✨ Concluído. STRIPE_SECRET_KEY e STRIPE_WEBHOOK_SECRET atualizadas (+ STRIPE_MASTER_CLUB_PRICE_ID, RESEND_API_KEY, OPENAI_API_KEY se indicados)."
echo "   Para voltar a produção: ./update_stripe_production.sh"
echo ""
