#!/bin/bash
# Envia os templates de email do Auth (magic link, confirmation, recovery, email change) para o servidor.
#
# Uso: ./deploy_auth_templates.sh
# Requer: ssh e rsync no PATH
#
# Onde sobem os ficheiros:
#   - No servidor (host): REMOTE_TEMPLATES_DIR (ex.: /root/supabase-project/volumes/auth/templates)
#   - No env do Auth usas o path DENTRO do container: CONTAINER_TEMPLATES_PATH (ex.: /templates)
# O volume no docker-compose deve montar REMOTE_TEMPLATES_DIR em CONTAINER_TEMPLATES_PATH.

set -e
SERVER="root@168.231.112.159"

# Onde os ficheiros sobem NO SERVIDOR (path no host). Tem de ser o mesmo que o volume monta no compose.
REMOTE_TEMPLATES_DIR="/root/supabase-project/volumes/auth/templates"

# Path DENTRO do container onde o volume monta. É este path que vais usar nas variáveis GOTRUE_MAILER_TEMPLATES_*.
# Ajuste se no docker-compose montar noutro sítio (ex.: /var/lib/supabase/templates).
CONTAINER_TEMPLATES_PATH="/templates"

LOCAL_TEMPLATES_DIR="$(cd "$(dirname "$0")" && pwd)/supabase/templates"

echo "📧 Deploy dos templates de email do Auth para $SERVER"
echo "   Local (repo):  $LOCAL_TEMPLATES_DIR"
echo "   No servidor:   $REMOTE_TEMPLATES_DIR  (path no host)"
echo "   No env Auth:   $CONTAINER_TEMPLATES_PATH  (path dentro do container)"
echo ""

ssh $SERVER "mkdir -p $REMOTE_TEMPLATES_DIR"

rsync -avz \
  "$LOCAL_TEMPLATES_DIR/" \
  "$SERVER:$REMOTE_TEMPLATES_DIR/" \
  --exclude '.DS_Store' \
  --exclude 'GOTRUE_TEMPLATES_ENV.example'

echo ""
echo "✅ Templates enviados: confirmation.html, recovery.html, magic_link.html, email_change.html"
echo ""
echo "   Coloca estas variáveis no env do Auth (docker-compose ou .env do Auth):"
echo ""
echo "   GOTRUE_MAILER_TEMPLATES_CONFIRMATION=$CONTAINER_TEMPLATES_PATH/confirmation.html"
echo "   GOTRUE_MAILER_TEMPLATES_RECOVERY=$CONTAINER_TEMPLATES_PATH/recovery.html"
echo "   GOTRUE_MAILER_TEMPLATES_MAGIC_LINK=$CONTAINER_TEMPLATES_PATH/magic_link.html"
echo "   GOTRUE_MAILER_TEMPLATES_EMAIL_CHANGE=$CONTAINER_TEMPLATES_PATH/email_change.html"
echo ""
echo "   No docker-compose o volume deve ser: $REMOTE_TEMPLATES_DIR:$CONTAINER_TEMPLATES_PATH"
echo "   Depois: docker restart supabase-auth (ou docker compose up -d auth)"
echo ""
