# Pausa Hidratacao

Aplicacao web para lembrar pausas de hidratacao, com interface de painel (sidebar, tema claro/escuro e graficos), importada do Claude Design.

## Funcionalidades

- Timer configuravel entre 1 e 240 minutos, com slider e atalhos de 5, 10, 15, 20 e 30 minutos.
- Acoes de iniciar, pausar, retomar e resetar, com indicador de status (parado, em andamento, pausado).
- Anel de progresso circular para a proxima pausa.
- Modal de alerta quando chega a hora de beber agua, com confirmar ou adiar por 5 minutos.
- Registro de cada agua com horario (timestamp) e historico por dia.
- Pagina de Historico com grafico dos ultimos 7 dias, media diaria e dias com meta batida.
- Mascote animado que reage ao progresso da meta do dia.
- Meta diaria e volume por agua configuraveis em ml/litros, com barra de progresso.
- Tema claro ("limpo") e escuro ("placar"), alternavel na sidebar.
- Som opcional via Web Audio API e notificacoes do sistema quando permitidas.
- Idiomas portugues e ingles.

## Como rodar

Requisitos:

- Node.js 18 ou superior.

Inicie o servidor local:

```sh
npm start
```

Por padrao, a aplicacao roda em:

```text
http://127.0.0.1:4173
```

Para usar outra porta:

```sh
PORT=3000 npm start
```

## Validacao

Execute a checagem de sintaxe JavaScript:

```sh
npm run check
```

Execute os testes unitarios:

```sh
npm test
```

Os testes cobrem os utilitarios puros (`public/app-utils.js`): tempo/data, formatacao de volume, progresso da meta, transicoes do timer e a migracao do estado salvo antigo para o novo schema.

## Estrutura atual

```text
.
├── public/
│   ├── app.js       # Logica da aplicacao: estado, timer, render do DOM, i18n, temas, audio e notificacoes
│   ├── app-utils.js # Funcoes puras reutilizaveis e testaveis (inclui migracao de dados)
│   ├── index.html   # Shell minimo; a interface e construida pelo app.js
│   └── styles.css   # Resets globais e animacoes compartilhadas
├── server.js        # Servidor HTTP estatico local
├── package.json     # Scripts do projeto
└── tests/           # Testes unitarios
```

## Observacoes tecnicas

- O estado e salvo no `localStorage` do navegador sob a chave `hb_state`.
- Dados do app anterior (chave `pausa-hidratacao:v1`, com historico em contagem diaria) sao migrados automaticamente no primeiro carregamento para o novo schema (`days` com entradas por horario), preservando preferencias e historico.
- O grosso do estilo dos componentes fica inline no `app.js`, portado da fonte do Claude Design; `styles.css` cobre apenas resets, animacoes e o colapso da sidebar em telas estreitas.
- O timer pode sofrer atraso se a aba ficar em segundo plano, por limitacoes comuns dos navegadores.
- O servidor serve apenas a pasta `public/`, mantendo arquivos internos como `server.js` e `package.json` fora do acesso HTTP.
