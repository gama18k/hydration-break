# Pausa Hidratacao

Aplicacao web simples para lembrar pausas de hidratacao, com visual inspirado em placar de jogo.

## Funcionalidades

- Timer configuravel entre 1 e 240 minutos.
- Atalhos de intervalo para 5, 10, 15, 20 e 30 minutos.
- Acoes de iniciar, pausar, retomar e resetar.
- Modal de alerta quando chega a hora de beber agua.
- Opcao de adiar por 5 minutos.
- Registro diario de aguas confirmadas com historico local.
- Meta diaria configuravel em ml/litros com barra de progresso e volume por agua.
- Som opcional via Web Audio API.
- Notificacoes do sistema quando permitidas pelo navegador.
- Idiomas portugues e ingles.

## Como rodar

Requisitos:

- Node.js 18 ou superior.

Instale dependencias se houverem no futuro:

```sh
npm install
```

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

Atualmente os testes cobrem utilitarios de tempo/data, normalizacao do estado salvo, historico, progresso da meta diaria em ml/litros e transicoes principais do timer.

## Estrutura atual

```text
.
├── public/
│   ├── app.js       # Logica da aplicacao, estado, timer, i18n, audio e notificacoes
│   ├── app-utils.js # Funcoes puras reutilizaveis e testaveis
│   ├── index.html   # Marcacao principal da interface
│   └── styles.css   # Estilos visuais e responsividade
├── server.js        # Servidor HTTP estatico local
├── package.json     # Scripts do projeto
└── tests/           # Testes unitarios
```

## Observacoes tecnicas

- O estado e salvo no `localStorage` do navegador.
- Dados salvos no `localStorage` sao normalizados ao carregar, evitando estado invalido vindo de storage corrompido ou antigo.
- O timer pode sofrer atraso se a aba ficar em segundo plano, por limitacoes comuns dos navegadores.
- O servidor serve apenas a pasta `public/`, mantendo arquivos internos como `server.js` e `package.json` fora do acesso HTTP.

## Proximos passos recomendados

1. Adicionar tratamento de erro ao servidor.
2. Considerar testes de ponta a ponta para o fluxo de timer e modal.
3. Separar mais responsabilidades de `app.js` conforme novas funcionalidades forem adicionadas.
