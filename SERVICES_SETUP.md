# Services and Pricing Setup Guide

Este guia explica como configurar e usar a tabela de serviços e preços no Supabase.

## 1. Criar a Tabela no Supabase

Execute o arquivo `services_pricing_schema.sql` no SQL Editor do Supabase:

1. Acesse o Supabase Dashboard
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `services_pricing_schema.sql`
4. Execute o script

Isso criará:
- A tabela `services` com todos os campos necessários
- Os índices para otimização de queries
- Os triggers para atualização automática de timestamps
- Todos os serviços e preços inseridos

## 2. Estrutura da Tabela

```sql
services
├── id (UUID) - Primary Key
├── type (TEXT) - Tipo: 'Quick Fix', 'Multi Task', 'Standard', 'Insurance', 'Materials'
├── category (TEXT) - Categoria: 'Handyman', 'Plumbing/Electrician', 'Electrician', 'Carpenter', 'Painter'
├── service_name (TEXT) - Nome do serviço
├── description (TEXT) - Descrição detalhada
├── master_price (DECIMAL) - Preço Master em GBP
├── housekeep_price (DECIMAL) - Preço concorrente (opcional)
├── unit (TEXT) - Unidade: 'Hourly', 'Per m²', 'Per room', etc.
├── duration (TEXT) - Duração esperada
├── is_active (BOOLEAN) - Se o serviço está ativo
├── created_at (TIMESTAMP)
└── updated_at (TIMESTAMP)
```

## 3. Usando no Código React

### Importar as funções

```javascript
import { 
  getServices, 
  getServicesByCategory, 
  getServiceById,
  searchServices,
  getServicesGroupedByCategory,
  getCategories,
  getTypes
} from '../lib/services';
```

### Exemplos de Uso

#### Buscar todos os serviços ativos
```javascript
const services = await getServices();
```

#### Buscar serviços por categoria
```javascript
const handymanServices = await getServicesByCategory('Handyman');
```

#### Buscar um serviço específico
```javascript
const service = await getServiceById('service-uuid-here');
```

#### Buscar serviços por termo
```javascript
const results = await searchServices('door');
```

#### Buscar serviços agrupados por categoria
```javascript
const groupedServices = await getServicesGroupedByCategory();
// Retorna: { 'Handyman': [...], 'Carpenter': [...], ... }
```

#### Buscar todas as categorias
```javascript
const categories = await getCategories();
// Retorna: ['Carpenter', 'Electrician', 'Handyman', ...]
```

#### Buscar todos os tipos
```javascript
const types = await getTypes();
// Retorna: ['Materials', 'Multi Task', 'Quick Fix', 'Standard']
```

## 4. Exemplo Completo em um Componente

```javascript
import React, { useState, useEffect } from 'react';
import { getServicesByCategory, getServiceById } from '../lib/services';

const ServiceSelector = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      try {
        const handymanServices = await getServicesByCategory('Handyman');
        setServices(handymanServices);
      } catch (error) {
        console.error('Error loading services:', error);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  if (loading) return <div>Loading services...</div>;

  return (
    <div>
      {services.map(service => (
        <div key={service.id}>
          <h3>{service.service_name}</h3>
          <p>{service.description}</p>
          <p>Price: £{service.master_price} {service.unit}</p>
        </div>
      ))}
    </div>
  );
};
```

## 5. Atualizar Preços

Para atualizar preços, você pode fazer diretamente no Supabase ou criar uma função de atualização:

```javascript
import { supabase } from '../lib/supabase';

async function updateServicePrice(serviceId, newPrice) {
  const { data, error } = await supabase
    .from('services')
    .update({ master_price: newPrice })
    .eq('id', serviceId)
    .select()
    .single();

  if (error) {
    console.error('Error updating price:', error);
    return null;
  }

  return data;
}
```

## 6. Adicionar Novos Serviços

Para adicionar novos serviços, você pode usar o Supabase Dashboard ou criar uma função:

```javascript
import { supabase } from '../lib/supabase';

async function addService(serviceData) {
  const { data, error } = await supabase
    .from('services')
    .insert([serviceData])
    .select()
    .single();

  if (error) {
    console.error('Error adding service:', error);
    return null;
  }

  return data;
}

// Exemplo de uso
const newService = await addService({
  type: 'Quick Fix',
  category: 'Handyman',
  service_name: 'New Service',
  description: 'Service description',
  master_price: 50.00,
  unit: 'Hourly',
  duration: '1 hour'
});
```

## 7. Políticas de Segurança (RLS)

Por padrão, a tabela `services` não tem RLS habilitado, pois os serviços são públicos. Se você quiser restringir o acesso, pode adicionar políticas:

```sql
-- Exemplo: Permitir leitura pública, mas escrita apenas para admins
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert services"
  ON services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );
```

## 8. Notas Importantes

- Todos os preços são armazenados em GBP (libra esterlina)
- O campo `housekeep_price` é opcional e usado apenas para comparação
- O campo `is_active` permite desativar serviços sem deletá-los
- Os timestamps `created_at` e `updated_at` são atualizados automaticamente
