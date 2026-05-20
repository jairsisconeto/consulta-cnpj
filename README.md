# Consulta CNPJ

Frontend React para consultar CNPJ na API pública [publica.cnpj.ws](https://publica.cnpj.ws).

## Funcionalidades

- Campo CNPJ com máscara `00.000.000/0000-00`
- Resumo: razão social, fantasia, situação, endereço, cidade/UF, CNAE, telefone, e-mail e inscrições estaduais
- Visualização dinâmica de todo o JSON (objetos, listas e tabelas)
- JSON bruto, copiar JSON e contador de campos preenchidos
- Formatação automática de CNPJ, CEP, datas, booleanos e capital social

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido no terminal (geralmente `http://localhost:5173`).

## Build

```bash
npm run build
npm run preview
```

## Publicar no GitHub Pages

O projeto já está configurado para deploy automático via GitHub Actions.

### Passos

1. Crie um repositório no GitHub e envie o código (`main` ou `master`).
2. Em **Settings → Pages**, em **Build and deployment**, escolha **Source: GitHub Actions**.
3. Faça push na branch `main` (ou `master`). O workflow `.github/workflows/deploy-pages.yml` gera o build e publica em Pages.

O site ficará em:

`https://<seu-usuario>.github.io/<nome-do-repositorio>/`

O `base` do Vite usa o nome do repositório automaticamente no CI (`VITE_BASE_PATH=/<nome-do-repo>/`). O nome do repositório no GitHub deve coincidir com a URL (ex.: repositório `Consulta-CNPJ` → `https://usuario.github.io/Consulta-CNPJ/`).

### Testar o build de Pages localmente

Substitua `Consulta-CNPJ` pelo nome do seu repositório:

**PowerShell:**

```powershell
$env:VITE_BASE_PATH="/Consulta-CNPJ/"
npm run build
npm run preview
```

**bash:**

```bash
VITE_BASE_PATH=/Consulta-CNPJ/ npm run build
npm run preview
```

### Arquivos relevantes

- `vite.config.ts` — `base` via `VITE_BASE_PATH` (padrão `/` em dev)
- `.github/workflows/deploy-pages.yml` — build e deploy
- `public/.nojekyll` — evita processamento Jekyll no Pages
