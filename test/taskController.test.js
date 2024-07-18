const chai = require('chai');
const chaiHttp = require('chai-http');
const { faker } = require('@faker-js/faker');
const app = require('../src/app'); // Certifique-se de que 'app.js' exporta app corretamente
const UserModel = require('../src/models/user');
const TaskModel = require('../src/models/task');

chai.use(chaiHttp);

const should = chai.should();

describe('Task Controller', () => {
  let token;
  let userId;
  let taskId;

  before(async () => {
    // Limpar o banco de dados antes de rodar os testes
    await UserModel.sync({ force: true });
    await TaskModel.sync({ force: true });

    // Registrar e autenticar um usuário para obter um token
    const fakeUser = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: 'password123',
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName()
    };

    await chai.request(app)
      .post('/api/users/register')
      .send(fakeUser);

    const loginRes = await chai.request(app)
      .post('/api/users/login')
      .send({
        username: fakeUser.username,
        password: 'password123'
      });

    token = loginRes.body.token;
    userId = loginRes.body.id;
  });

  describe('POST /api/tasks', () => {
    it('deve criar uma nova tarefa', (done) => {
      const fakeTask = {
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
        dueDate: faker.date.future()
      };

      chai.request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(fakeTask)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('title').eql(fakeTask.title);
          taskId = res.body.id;
          done();
        });
    });
  });

  describe('GET /api/tasks', () => {
    it('deve listar todas as tarefas do usuário autenticado', (done) => {
      chai.request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.length.should.be.eql(1);
          done();
        });
    });
  });

  describe('GET /api/tasks/:id', () => {
    it('deve obter uma tarefa específica pelo ID', (done) => {
      chai.request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('id').eql(taskId);
          done();
        });
    });

    it('não deve encontrar uma tarefa com um ID inválido', (done) => {
      chai.request(app)
        .get('/api/tasks/99999')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error').eql('Tarefa não encontrada');
          done();
        });
    });
  });

  describe('PUT /api/tasks/:id', () => {
    it('deve atualizar uma tarefa existente', (done) => {
      const updatedTask = {
        title: faker.lorem.words(3),
        description: faker.lorem.sentence(),
        priority: faker.helpers.arrayElement(['low', 'medium', 'high'])
      };

      chai.request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedTask)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('title').eql(updatedTask.title);
          done();
        });
    });

    it('não deve atualizar uma tarefa com um ID inválido', (done) => {
      chai.request(app)
        .put('/api/tasks/99999')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Updated Task',
          description: 'This is an updated test task',
          priority: 'medium'
        })
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error').eql('Tarefa não encontrada');
          done();
        });
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('deve deletar uma tarefa existente', (done) => {
      chai.request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Tarefa deletada com sucesso');
          done();
        });
    });

    it('não deve deletar uma tarefa com um ID inválido', (done) => {
      chai.request(app)
        .delete('/api/tasks/99999')
        .set('Authorization', `Bearer ${token}`)
        .end((err, res) => {
          res.should.have.status(404);
          res.body.should.be.a('object');
          res.body.should.have.property('error').eql('Tarefa não encontrada');
          done();
        });
    });
  });
});
