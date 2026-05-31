# Design System - Nebula Hub (FluentOps Edition)

Este documento especifica o Design System inspirado no **Nebula Hub**, adaptado para o ecossistema e interface do **FluentOps** (Business English & Professional Communication Coach).

O FluentOps agora assume por padrão este estilo focado em tons escuros profundos, estética espacial/tecnológica (Deep Obsidian), brilhos nebulosos (glowing accent components) e tipografia altamente refinada.

---

## 🎨 Paleta de Cores (Color Palette)

### 1. Tons Secundários & de Fundo (Obsidian Deep Backgrounds)
- **Fundo Principal (Primary Background)**: `#0C0B14` (Obsidian Space) ou `rgb(12 11 20)`. Representa o vazio pacífico e profundo do espaço.
- **Fundo de Cards (Card Background)**: `#151422` (Cosmic Card Layer). Cria uma distinção suave em relação ao fundo infinito.
- **Camada de Entrada (Input Background)**: `#1B192A` (Obsidian Inputs). Usado para campos de formulário, botões secundários desativados ou elementos focados.

### 2. Tons de Acento (Nebula Primary Accent Colors)
- **Roxo Principal (Saber/Nebula Purple)**: `#5542F6` (`rgb(85, 66, 246)`). A cor de destaque máxima do Nebula Hub. Usada para botões primários, gradientes de destaque e focos de ação.
- **Cores Especiais do Tab & Alertas (Aesthetic Statuses)**:
  - **Destaque Azul Celeste (Cygnus Blue)**: `#0066CC` ou `#3B82F6`.
  - **Sucesso Esmeralda (Solaris Green)**: `#10B981`.
  - **Alerta Flamejante (Nova Pink)**: `#E74694` ou `#EF4444`.

### 3. Tipografia & Cores de Texto (Stellar Typography)
- **Texto Principal**: `#FFFFFF` (Stellar White). Alta legibilidade.
- **Texto Secundário / Muted**: `#A3A2B5` (Nebula Silver/Dust). Suave para os olhos.
- **Texto Desativado**: `#52526b` (Dark Nebula).

---

## ✒️ Tipografia (Typography)
- **Exibição / Títulos de Destaque (Display Typography)**: `Outfit` (sans-serif) para títulos elegantes, dinâmicos e modernos.
- **Texto de Leitura (Body Typography)**: `Inter` (sans-serif) para legibilidade excepcional e alta densidade.
- **Terminal & Métricas (Mono Typography)**: `JetBrains Mono` para simulações de código, painéis, estatísticas e cronômetro de estudo.

---

## ✨ Componentes e Efeitos Visuais (Components & FX)

### 1. Glow Cards (Cards com Efeito de Brilho)
Para dar a sensação tridimensional cósmica do Nebula Hub:
- Bordas com opacidade sutil de tons de púrpura (`border-[#282A3E]` ou `border-[#373550]`).
- Brilhos radiais em segundo plano (`blur-[120px]` ou `blur-2xl` com opacidade ultra reduzida `bg-indigo-600/5` ou `bg-purple/10`).

### 2. Botões Primários (Interactive Action)
- Gradiente linear de `#5542F6` para `#6875F5`.
- Efeito de hover com leve scale (`hover:scale-[1.02]`) e brilho de borda ou shadow correspondente.

---

## 📱 Responsividade & UX (Responsive Architecture)
- **Desktop Grid**: Layouts de Bento-Grid em 3 ou 4 colunas para otimização de telas grandes.
- **Layout Lateral Inteligente (Collapsed Sidebar)**: O menu esquerdo pode ser recolhido para ocupar pouquíssimo espaço de tela (apenas ícones), expandindo com um clique.
- **Mobile Friendly**: Grid em coluna única no celular, ocultação de barras laterais excessivas para focar no conteúdo principal, botões de toque com tamanho mínimo de `44px`.
