# Configuração do Supabase Storage para Imagens

## Bucket a ser criado

**Nome do bucket:** `request-images`

## Criar o bucket via SQL

No Supabase, você pode criar o bucket usando a função SQL:

```sql
-- Criar o bucket 'request-images' como público
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'request-images',
  'request-images',
  true,  -- Bucket público (permite acesso via URL pública)
  5242880,  -- Limite de 5MB por arquivo (opcional, ajuste conforme necessário)
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']  -- Apenas imagens (opcional)
);
```

**Nota:** Se você preferir criar via interface:

1. Acesse o painel do Supabase
2. Vá para **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure:
   - **Name:** `request-images`
   - **Public bucket:** ✅ Marque como público
   - **File size limit:** (opcional) 5MB
   - **Allowed MIME types:** (opcional) `image/jpeg,image/png,image/gif,image/webp`
5. Clique em **Create bucket**

## Configuração de Políticas RLS (Row Level Security)

Após criar o bucket, configure as políticas de segurança:

### Política para Upload (INSERT)

```sql
-- Permitir que usuários autenticados façam upload de imagens
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'request-images');
```

### Política para Leitura (SELECT)

```sql
-- Permitir que usuários autenticados leiam imagens
CREATE POLICY "Users can view images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'request-images');
```

### Política para Deletar (DELETE)

```sql
-- Permitir que usuários autenticados deletem suas próprias imagens
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'request-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Estrutura de Pastas

O código organiza as imagens da seguinte forma:

- `{requestId}/{timestamp}_{index}.{ext}`
- Exemplo: `2a32aa01-30dd-4e37-b950-8f662c8df916/1703123456789_0.jpg`

Cada request tem sua própria pasta dentro do bucket, facilitando a organização e limpeza de imagens.

## Nota

Se você quiser tornar o bucket totalmente público (sem necessidade de autenticação para visualizar), você pode configurar as políticas para `anon` também, mas isso não é recomendado para dados sensíveis.
