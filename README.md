# Vibex AudioCar · site

Site da **Vibex AudioCar**, som automotivo em Aparecida de Goiânia (GO).
Página única com o projeto de som montado em 3D conforme a rolagem, galeria de trabalhos e contatos.

Feito em HTML, CSS e JavaScript puros: sem dependências, sem etapa de build.

## Estrutura

```
index.html            página
css/style.css         estilos
js/main.js            modelo 3D do carro, animação por rolagem e galeria
img/favicon.svg       ícone da aba (marca V)
img/galeria/          imagens da galeria (ilustrações provisórias)
```

## Rodar localmente

Abra o `index.html` no navegador. Para testar como num servidor:

```bash
python -m http.server 8000
# abra http://localhost:8000
```

## Publicar no GitHub Pages

```bash
git init
git add .
git commit -m "Site Vibex AudioCar"
git branch -M main
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main
```

No GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, escolha `main` e a pasta `/ (root)`.
O site fica em `https://<usuario>.github.io/<repositorio>/`.

## Trocar as fotos da galeria

As imagens em `img/galeria/` são ilustrações de amostra. Para usar fotos reais:

1. Coloque as fotos em `img/galeria/` (de preferência em 16:9, até ~300 KB cada, em `.jpg` ou `.webp`).
2. No `index.html`, na seção `#galeria`, troque o caminho em `data-src` e no `src` da `<img>` de cada botão, e a legenda em `data-cap` e `alt`.
3. Atualize também o `src` e a legenda da imagem grande (`#bigimg` / `#bigcap`), que mostra a primeira foto.

## Contatos usados no site

- WhatsApp: (62) 9616-6397
- Instagram: [@vibex_audiocar](https://instagram.com/vibex_audiocar)
- Endereço: Av. Diamante, 13 · Vila Oliveira, Aparecida de Goiânia - GO, 74955-220
- Horário: segunda a sábado, 8h às 19h
