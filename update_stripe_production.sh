#!/bin/bash

# Script para atualizar Stripe keys de produção nas Edge Functions
# Uso: ./update_stripe_production.sh

echo "🔧 Atualizando Stripe keys para produção..."
echo ""

# Solicitar as chaves
read -p "Digite a STRIPE_SECRET_KEY de produção (sk_live_...): " STRIPE_SECRET_KEY
read -p "Digite a STRIPE_WEBHOOK_SECRET de produção (whsec_...): " STRIPE_WEBHOOK_SECRET

if [ -z "$STRIPE_SECRET_KEY" ] || [ -z "$STRIPE_WEBHOOK_SECRET" ]; then
    echo "❌ Erro: Ambas as chaves são obrigatórias!"
    exit 1
fi

# Validar formato
if [[ ! $STRIPE_SECRET_KEY == sk_live_* ]]; then
    echo "⚠️  Aviso: STRIPE_SECRET_KEY não começa com 'sk_live_'"
    read -p "Continuar mesmo assim? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

if [[ ! $STRIPE_WEBHOOK_SECRET == whsec_* ]]; then
    echo "⚠️  Aviso: STRIPE_WEBHOOK_SECRET não começa com 'whsec_'"
    read -p "Continuar mesmo assim? (y/n): " confirm
    if [ "$confirm" != "y" ]; then
        exit 1
    fi
fi

echo ""
echo "📦 Parando container atual..."
ssh root@168.231.112.159 "docker stop supabase-edge-functions"

echo "🗑️  Removendo container antigo..."
ssh root@168.231.112.159 "docker rm supabase-edge-functions"

echo "🚀 Recriando container com novas chaves..."
ssh root@168.231.112.159 "docker run -d \
  --name supabase-edge-functions \
  --network supabase_default \
  --alias functions \
  -e STRIPE_SECRET_KEY='$STRIPE_SECRET_KEY' \
  -e STRIPE_WEBHOOK_SECRET='$STRIPE_WEBHOOK_SECRET' \
  -e SUPABASE_URL='https://supabase.wearemaster.com' \
  -e SUPABASE_SERVICE_ROLE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJzZXJ2aWNlX3JvbGUiLAogICAgImlzcyI6ICJzdXBhYmFzZS1kZW1vIiwKICAgICJpYXQiOiAxNjQxNzY5MjAwLAogICAgImV4cCI6IDE3OTk1MzU2MDAKfQ.DaYlNEoUrrEn2Ig7tqibS-PHK5vgusbcbo7X36XVt4Q' \
  -e SUPABASE_ANON_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE' \
  -e SUPABASE_DB_URL='postgresql://postgres:Master2025!!@db:5432/postgres' \
  -e VERIFY_JWT='false' \
  -v /root/supabase/functions:/home/deno/functions \
  supabase/edge-runtime:v1.45.2 start --main-service /home/deno/functions/main"

echo ""
echo "✅ Container recriado!"
echo ""
echo "🔍 Verificando status..."
ssh root@168.231.112.159 "docker ps | grep edge"

echo ""
echo "✨ Concluído! As Edge Functions agora estão usando as chaves de produção."
