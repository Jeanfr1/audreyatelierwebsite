# Roteiro de animação

## Hero / desktop
Uma área sticky de 100svh dentro de trecho de 240svh. Progresso normalizado de 0 a 1, derivado do scroll sem bloquear a página. A reserva permanece acionável.

| Progresso | Cena | Transformação |
|---|---|---|
| 0–0.18 | Macro dos fios | 03-macro-hair cobre o palco; escala 1.12→1.04; luz natural, sem partículas. |
| 0.18–0.42 | Retrato revelado | Crossfade para 02-hero-portrait; máscara suave cresce do centro; blur 8→0 px, título aparece em HTML. |
| 0.42–0.65 | Movimento | 07-meche-alpha cruza o primeiro plano; translateX 12→-10%, rotação -4→2°. Não simula cabelo 3D. |
| 0.65–0.88 | Painéis | Imagem do retrato reduz para 58% de largura; máscaras abrem cor, corte e textura. Evitar transformação facial. |
| 0.88–1 | Entrega | Palco perde o sticky e entrega a grade de especialidades sem salto. |

## Continuidade
Especialidades: revelar imagens por clip-path vertical em 450–650ms; atrasos máximos de 90ms. Nuances: movimento lateral discreto do macro (até 4%). Atendimento: imagem 06 entra com fade e translateY 16px. Contato: uma linha dourada termina junto ao CTA, sem efeito de explosão.

## Mobile
Sequência reduzida a macro→retrato, palco de 150svh no máximo. Painéis tornam-se cartões verticais em fluxo natural. Remover blur animado e limitar movimento da mecha a 4%. Usar recorte próprio do retrato, rosto sempre visível.

## Acessibilidade e desempenho
prefers-reduced-motion: hero estático e cartões visíveis. Nenhum texto escondido como única fonte de informação. Foco visível, navegação por teclado e botão de reserva presente. Animar transform/opacity; não usar dezenas de filtros. Decodificar hero antecipadamente, lazy-load abaixo da dobra. Evitar canvas se máscaras CSS forem suficientes.

O estudo offline permite arrastar o progresso e testar o ritmo; não substitui revisão de implementação em navegador real.
