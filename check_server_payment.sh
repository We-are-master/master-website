#!/bin/bash
# Verifica no servidor se as Edge Functions e env estão ok para pagamento.
# Uso: ./check_server_payment.sh
# Requer: ssh

set -e
SERVER="root@168.231.112.159"
# Tem de ser o mesmo path que REMOTE_DIR no deploy_edge_functions.sh e -v nos update_stripe_*.sh
FUNCTIONS_DIR="/root/supabase-project/volumes/functions"
CONTAINER="supabase-edge-functions"

echo "=== Verificando servidor $SERVER ==="
echo ""

echo "1. Funções em $FUNCTIONS_DIR"
ssh $SERVER "ls -la $FUNCTIONS_DIR 2>/dev/null || echo 'Pasta não encontrada'"
echo ""

echo "2. create-payment-intent existe?"
ssh $SERVER "ls -la $FUNCTIONS_DIR/create-payment-intent/index.ts 2>/dev/null || echo 'Ficheiro não encontrado'"
echo ""

echo "3. Variáveis de ambiente do container (STRIPE, SUPABASE_URL)"
ssh $SERVER "docker exec $CONTAINER env 2>/dev/null | grep -E 'STRIPE_SECRET_KEY|SUPABASE_URL|SUPABASE_SERVICE' | sed 's/=.*/=***/' || echo 'Container não encontrado ou sem permissão'"
echo ""

echo "4. STRIPE_SECRET_KEY está definida? (só mostra se existe, não o valor)"
ssh $SERVER "docker exec $CONTAINER sh -c 'test -n \"\$STRIPE_SECRET_KEY\" && echo OK || echo FALTA STRIPE_SECRET_KEY'" 2>/dev/null || echo "Container inacessível"
echo ""

echo "5. SUPABASE_URL está definida?"
ssh $SERVER "docker exec $CONTAINER sh -c 'echo \$SUPABASE_URL'" 2>/dev/null || echo "Container inacessível"
echo ""

echo "6. Últimas 30 linhas dos logs do container (erros ao chamar create-payment-intent)"
ssh $SERVER "docker logs $CONTAINER --tail 30 2>&1" || echo "Falha a obter logs"
echo ""

echo "=== Fim da verificação ==="
echo ""
echo "Se STRIPE_SECRET_KEY ou SUPABASE_URL faltarem: edite o .env no servidor"
echo "  ssh $SERVER"
echo "  nano /root/supabase-project/.env  # ou o ficheiro que o docker run usa com --env-file"
echo "  Adicione STRIPE_SECRET_KEY=sk_test_... e SUPABASE_URL=https://supabase.wearemaster.com"
echo "  docker restart $CONTAINER"
echo ""
echo "Se receber 503 ou 'No such file': deploy e container têm de usar o MESMO path."
echo "  deploy_edge_functions.sh: REMOTE_DIR=$FUNCTIONS_DIR"
echo "  update_stripe_test.sh / update_stripe_production.sh: -v $FUNCTIONS_DIR:/home/deno/functions"
echo ""
