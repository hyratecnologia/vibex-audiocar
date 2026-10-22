# Vibex AudioCar · site

Site da **Vibex AudioCar**, loja de som automotivo e acessórios em Aparecida de Goiânia (GO).

No ar em: https://hyratecnologia.github.io/vibex-audiocar/

Feito em HTML, CSS e JavaScript puros: sem dependências e sem etapa de build.

## Versões

| Versão | O que é | Como acessar |
|---|---|---|
| **2.0** (atual) | Site completo baseado no estudo de mercado: perfis de som, serviços, Raio-X 3D, regulagem RTA, projetos, loja, FAQ e orçamento guiado | branch `main` |
| 1.0 | Página única com o projeto de som em 3D animado pela rolagem | tag [`v1.0`](https://github.com/hyratecnologia/vibex-audiocar/releases/tag/v1.0) (`git checkout v1.0`) |

## Estrutura

```
index.html              página (todas as seções)
css/style.css           estilos, mobile-first (quebras em 480, 768 e 1024 px)
js/main.js              menu, links de WhatsApp, orçamento guiado, animações
js/raio-x.js            modelo 3D do carro (carrega só quando a seção aparece)
img/                    logo, ícones, banner e imagem de compartilhamento
img/projetos/, img/loja/ fotos ilustrativas (ver img/CREDITOS.md)
img/galeria/            ilustrações antigas (sem uso)
site.webmanifest        ícone e cores para "adicionar à tela inicial"
robots.txt, sitemap.xml SEO
```

## Seções

1. **Hero**: chamada, botão de orçamento e desenho técnico do carro
2. **Escolha seu som**: Upgrade de fábrica, Trio goiano, Pressão e eventos
3. **Serviços**: som, regulagem RTA, forro de porta, multimídia, elétrica, iluminação, películas, estética e acessórios
4. **Raio-X do carro**: modelo 3D com as camadas (portas, graves, módulos, multimídia, elétrica)
5. **Regulagem RTA**: gráfico antes e depois
6. **Como trabalhamos**: 5 passos
7. **Por que a Vibex**: diferenciais e marcas
8. **Projetos**: portfólio (hoje com fotos ilustrativas)
9. **Instagram**
10. **A loja**: fotos, mapa, endereço, horário, pagamento
11. **Dúvidas** (FAQ)
12. **Orçamento guiado**: formulário que monta a mensagem e abre o WhatsApp

## Rodar localmente

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Publicar alterações

```bash
git add .
git commit -m "descrição da mudança"
git push
```

O GitHub Pages atualiza o site em cerca de 1 minuto.

## Trocar as fotos

Use fotos em `.webp` ou `.jpg`, com até ~300 KB cada (dá para reduzir em squoosh.app).

**Projetos** (`#projetos` no `index.html`): em cada `<li class="project">`, troque o `src` da imagem em `img/projetos/` pela foto real, escreva um `alt` descrevendo a foto e ajuste a categoria, o título e o texto (carro, objetivo, equipamento). Depois apague o parágrafo "Imagens ilustrativas…" e as legendas "foto ilustrativa" da loja.

**Loja** (`#loja`): troque o conteúdo de cada `.photo-slot` por
`<img src="img/loja/fachada.webp" alt="Fachada da Vibex AudioCar" loading="lazy">`.

## Contatos usados no site

- WhatsApp: (62) 9616-6397 (número em `js/main.js`, constante `WHATSAPP`, e nos links do `index.html`)
- Instagram: [@vibex_audiocar](https://instagram.com/vibex_audiocar)
- Endereço: Av. Diamante, 13 · Vila Oliveira, Aparecida de Goiânia - GO, 74955-220
- Horário: segunda a sábado, 8h às 19h
