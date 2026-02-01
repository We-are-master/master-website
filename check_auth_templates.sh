#!/bin/bash
# Diagnóstico no servidor: onde o Auth (GoTrue) monta volumes e se o template existe.
# Uso: ./check_auth_templates.sh
# Executa via ssh no servidor e mostra onde colocar o magic_link.html e como o Auth está configurado.

set -e
SERVER="root@168.231.112.159"
CONTAINER="supabase-auth"

echo "=== Diagnóstico Auth (GoTrue) – template magic link ==="
echo ""

echo "1. Volumes montados no container $CONTAINER:"
ssh $SERVER "docker inspect $CONTAINER --format '{{range .Mounts}}Source: {{.Source}} -> Destination: {{.Destination}}{{println}}{{end}}'"
echo ""

echo "2. Working dir do Auth:"
ssh $SERVER "docker inspect $CONTAINER --format '{{.Config.WorkingDir}}'"
echo ""

echo "3. Ficheiros em /root/supabase-project/volumes/auth/templates (path do deploy_auth_templates.sh):"
ssh $SERVER "ls -la /root/supabase-project/volumes/auth/templates 2>/dev/null || echo 'Pasta não existe'"
echo ""

echo "4. Primeiras linhas de magic_link.html nesse path (se existir):"
ssh $SERVER "head -5 /root/supabase-project/volumes/auth/templates/magic_link.html 2>/dev/null || echo 'Ficheiro não encontrado'"
echo ""

echo "5. Env do Auth (GOTRUE_* / SMTP / template):"
ssh $SERVER "docker exec $CONTAINER env 2>/dev/null | grep -E 'GOTRUE_|SMTP_|template|content_path' | sed 's/=.*/=***/' || true"
echo ""

echo "=== Conclusão ==="
echo "Se em (1) não aparecer nenhum volume a montar .../auth/templates (ou templates) para dentro do container,"
echo "o Auth não está a ver o ficheiro que o deploy_auth_templates.sh envia."
echo "Solução: no docker-compose do Supabase no servidor, adicione um volume para os templates, por exemplo:"
echo "  volumes:"
echo "    - /root/supabase-project/volumes/auth/templates:/path/to/templates"
echo "e no config do Auth (config.toml ou env) defina content_path para esse path dentro do container."
echo "Depois: ./deploy_auth_templates.sh e docker restart supabase-auth"
echo ""
