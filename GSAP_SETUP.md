# GSAP Setup e Instalação

## Instalação

Para instalar o GSAP, execute no terminal:

```bash
npm install gsap
```

## O que foi implementado

### 1. Hooks Customizados (`src/hooks/useGSAP.js`)
- `useGSAP` - Hook genérico para animações GSAP
- `useFadeIn` - Animação de fade in no scroll
- `useSlideInLeft` - Slide in da esquerda
- `useSlideInRight` - Slide in da direita
- `useScaleIn` - Animação de escala
- `useStagger` - Animação em sequência (stagger)
- `useParallax` - Efeito parallax

### 2. Animações Implementadas

#### HeroB2C
- ✅ Animações de entrada sequenciais (badge → title → subtitle → search → trust)
- ✅ Rotação contínua dos círculos de fundo
- ✅ Efeito parallax no scroll
- ✅ Hover effects nos botões e elementos interativos
- ✅ Animação de click no botão de busca

#### PopularServicesB2C
- ✅ Fade in do título no scroll
- ✅ Stagger animation nos cards de serviços
- ✅ Hover effects com GSAP (elevação, rotação de ícones, zoom de imagens)
- ✅ Animação de click nos cards

#### TestimonialsB2C
- ✅ Fade in do título
- ✅ Stagger animation nos cards de depoimentos
- ✅ Hover effects com rotação de ícones
- ✅ Animação do badge Trustpilot

#### HowItWorksB2C
- ✅ Pulse animation no background
- ✅ Stagger animation nos steps
- ✅ Hover effects com rotação dos badges numerados
- ✅ Animações de entrada suaves

#### WhyChooseB2C
- ✅ Stagger animation nos benefit cards
- ✅ Hover effects com rotação de ícones
- ✅ Counter animation nos números das estatísticas
- ✅ Scale in animation na seção de stats

#### FooterB2C
- ✅ Stagger animation nas colunas
- ✅ Hover effects em todos os links
- ✅ Animações nos botões de app store
- ✅ Hover effects nas redes sociais

## Tipos de Animações

### ScrollTrigger Animations
- Animações que são acionadas quando o elemento entra na viewport
- Configuradas para começar quando o elemento está a 80% da tela
- Reversíveis ao fazer scroll para cima

### Hover Animations
- Transformações suaves em hover
- Rotação, escala, elevação
- Mudanças de cor e sombra

### Stagger Animations
- Animações em sequência para listas/grids
- Delay progressivo entre elementos
- Efeito visual profissional

### Parallax Effects
- Movimento em diferentes velocidades
- Cria profundidade visual
- Suave e performático

## Performance

- Todas as animações usam `will-change` implicitamente via GSAP
- ScrollTrigger otimizado para performance
- Animações pausadas quando fora da viewport
- Cleanup automático com `gsap.context()`

## Próximos Passos (Opcional)

1. **Scroll Progress Indicator** - Barra de progresso no topo
2. **Magnetic Buttons** - Botões que seguem o mouse
3. **Text Reveal Animations** - Texto revelado letra por letra
4. **Image Parallax** - Parallax em imagens específicas
5. **Cursor Effects** - Cursor customizado com trail

## Exemplo de Uso

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Fade in on scroll
gsap.fromTo(element,
  { opacity: 0, y: 50 },
  {
    opacity: 1,
    y: 0,
    duration: 1,
    scrollTrigger: {
      trigger: element,
      start: 'top 80%'
    }
  }
);
```
