#!/bin/bash
# Adiciona o volume dos templates de email ao serviço Auth no docker-compose do servidor
# e reinicia o Auth para o magic link usar o template Master.
#
# Uso: ./setup_auth_templates_volume.sh
# Requer: ssh no PATH

set -e
SERVER="root@168.231.112.159"
COMPOSE_PATH="/root/supabase-project/docker-compose.yml"
TEMPLATES_HOST="/root/supabase-project/volumes/auth/templates"
TEMPLATES_CONTAINER="/var/lib/supabase/templates"

echo "📧 Configurar volume dos templates no Auth (docker-compose no servidor)"
echo "   Ficheiro: $COMPOSE_PATH"
echo "   Volume:   $TEMPLATES_HOST -> $TEMPLATES_CONTAINER"
echo ""

ssh $SERVER "set -e
  COMPOSE_PATH='$COMPOSE_PATH'
  TEMPLATES_HOST='$TEMPLATES_HOST'
  TEMPLATES_CONTAINER='$TEMPLATES_CONTAINER'
  if [ ! -f \"\$COMPOSE_PATH\" ]; then
    echo '❌ Ficheiro não encontrado: '\$COMPOSE_PATH
    echo '   Ajuste COMPOSE_PATH no script setup_auth_templates_volume.sh'
    exit 1
  fi
  if grep -q 'volumes/auth/templates' \"\$COMPOSE_PATH\" 2>/dev/null; then
    echo '✅ O volume dos templates já está no docker-compose. Nada a fazer.'
    exit 0
  fi
  echo '📋 Backup do docker-compose...'
  cp \"\$COMPOSE_PATH\" \"\${COMPOSE_PATH}.bak.\$(date +%Y%m%d%H%M%S)\"
  echo '📝 A adicionar volume ao serviço auth...'
  awk -v host=\"\$TEMPLATES_HOST\" -v dest=\"\$TEMPLATES_CONTAINER\" '
    /^  (auth|supabase-auth):\$/ { in_auth=1; has_vol=0; next }
    in_auth && /^    volumes:/       { has_vol=1 }
    in_auth && /^    [a-z]/ && !done && !has_vol {
      print \"    volumes:\"
      print \"      - \" host \":\" dest
      done=1
    }
    in_auth && /^  [a-z]/ && !/^  (auth|supabase-auth)\$/ { in_auth=0; done=0 }
    { print }
  ' \"\$COMPOSE_PATH\" > \"\${COMPOSE_PATH}.tmp\" && mv \"\${COMPOSE_PATH}.tmp\" \"\$COMPOSE_PATH\"
  echo '✅ Volume adicionado.'
  echo ''
  echo '🔄 A reiniciar o container do Auth...'
  (cd \"\$(dirname \"\$COMPOSE_PATH\")\" && docker compose -f \"\$(basename \"\$COMPOSE_PATH\")\" up -d auth) 2>/dev/null || \
  docker restart supabase-auth 2>/dev/null || \
  echo 'Reinício manual: cd \$(dirname '\$COMPOSE_PATH') && docker compose up -d auth'
  echo ''
  echo '✨ Concluído. Confirme que o Auth monta o volume:'
  echo '   docker inspect supabase-auth --format \"{{range .Mounts}}{{.Source}} -> {{.Destination}}{{println}}{{end}}\"'
  echo '   Depois peça um novo magic link e verifique se o email vem com o template Master.'
"

echo ""
echo "Se o teu docker-compose estiver noutro path, edite COMPOSE_PATH no script e execute de novo."
echo "Se o serviço do Auth tiver outro nome (ex.: gotrue), edite a linha do awk no script (auth|supabase-auth)."
echo ""
echo "Se depois do volume o email continuar com o template antigo, o Auth pode precisar de config (content_path)"
echo "para o template: ver EMAIL_VERIFICATION_SETUP.md, secção 'O email ainda vem com o template antigo'."
echo ""
