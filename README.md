# API de Gerenciamento de Tarefas

## Descrição

Esta API permite o gerenciamento de tarefas com funcionalidades de CRUD e autenticação de usuários.

## Tecnologias Utilizadas

- Node.js
- Express
- SQLite
- Sequelize
- JWT (Json Web Token)
- bcryptjs
- dotenv
- Mocha (para testes)
- Chai (para testes)
- Swagger (para documentação da API)

## Instalação

1. Clone o repositório:
   ```plaintext
     git clone <URL>
     cd project-root
      ``` 

2. Instale as dependências:

```plaintext
npm install
```
    


3. Configure o arquivo `.env` com as seguintes variáveis:

    PORT=3000
    JWT_SECRET=sercretkey
    

4. Inicie o servidor:
   ```plaintext
   npm start
    ```
   
    

## Uso

A API possui os seguintes endpoints:

### Autenticação

- **POST** `/api/users/register` - Registrar um novo usuário
- **POST** `/api/users/login` - Autenticar usuário e retornar um token

### Tarefas

- **POST** `/api/tasks` - Criar uma nova tarefa
- **GET** `/api/tasks` - Listar todas as tarefas do usuário autenticado
- **GET** `/api/tasks/:id` - Obter uma tarefa específica pelo ID
- **PUT** `/api/tasks/:id` - Atualizar uma tarefa existente
- **DELETE** `/api/tasks/:id` - Deletar uma tarefa existente

### Exemplo de Requisição

#### POST /api/users/login

Request:
{
  "username": "testuser",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

## Testes
Para rodar os testes, utilize o comando:
   ```plaintext
    npm test
   ```


Os testes foram implementados utilizando Mocha e Chai. Eles cobrem os principais endpoints da API, garantindo que todas as funcionalidades funcionem corretamente.

## Documentação da API
Para mais detalhes sobre os endpoints e como utilizá-los, acesse a documentação Swagger.

 ## Estrutura do Projeto:
   ```plaintext
   project-root
│
├── src
│   ├── controllers
│   │   ├── taskController.js
│   │   └── userController.js
│   ├── middlewares
│   │   ├── authenticate.js
│   │   └── errorHandler.js
│   ├── models
│   │   ├── task.js
│   │   └── user.js
│   ├── routes
│   │   ├── taskRoutes.js
│   │   └── userRoutes.js
│   ├── database
│   │   └── connection.js
│   ├── swaggerSchemas.js
│   └── app.js
│
├── test
│   ├── taskController.test.js
│   └── userController.test.js
│
├── .env
├── package.json
└── README.md
   ```
