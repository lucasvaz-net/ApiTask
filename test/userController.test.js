const chai = require('chai');
const chaiHttp = require('chai-http');
const { faker } = require('@faker-js/faker');
const app = require('../src/app'); // Certifique-se de que 'app.js' exporta app corretamente
const UserModel = require('../src/models/user');

chai.use(chaiHttp);
const should = chai.should();

describe('User Controller', () => {
  before(async () => {
    await UserModel.sync({ force: true });
  });

  describe('POST /api/users/register', () => {
    it('deve registrar um novo usuário', (done) => {
      const fakeUser = {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: 'password123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName()
      };

      chai.request(app)
        .post('/api/users/register')
        .send(fakeUser)
        .end((err, res) => {
          res.should.have.status(201);
          res.body.should.be.a('object');
          res.body.should.have.property('message').eql('Usuário registrado com sucesso');
          done();
        });
    });

    it('não deve registrar um usuário com nome de usuário duplicado', (done) => {
      const duplicateUser = {
        username: 'testuser',
        email: faker.internet.email(),
        password: 'password123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName()
      };

      // Registrar o usuário pela primeira vez
      chai.request(app)
        .post('/api/users/register')
        .send(duplicateUser)
        .end((err, res) => {
          res.should.have.status(201);
          // Tentar registrar o usuário novamente
          chai.request(app)
            .post('/api/users/register')
            .send(duplicateUser)
            .end((err, res) => {
              res.should.have.status(400);
              res.body.should.be.a('object');
              res.body.should.have.property('error').eql('Nome de usuário já existe');
              done();
            });
        });
    });
  });

  describe('POST /api/users/login', () => {
    let token;

    before(async () => {
      const fakeUser = {
        username: 'testuser',
        email: faker.internet.email(),
        password: 'password123',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName()
      };

      await chai.request(app)
        .post('/api/users/register')
        .send(fakeUser);
    });

    it('deve autenticar um usuário e retornar um token', (done) => {
      chai.request(app)
        .post('/api/users/login')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a('object');
          res.body.should.have.property('token');
          token = res.body.token;
          done();
        });
    });

    it('não deve autenticar um usuário com credenciais inválidas', (done) => {
      chai.request(app)
        .post('/api/users/login')
        .send({
          username: 'wronguser',
          password: 'wrongpassword'
        })
        .end((err, res) => {
          res.should.have.status(400);
          res.body.should.be.a('object');
          res.body.should.have.property('error').eql('Nome de usuário ou senha incorretos');
          done();
        });
    });

    describe('GET /api/users/profile', () => {
      it('deve obter o perfil do usuário autenticado', (done) => {
        chai.request(app)
          .get('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('username').eql('testuser');
            done();
          });
      });

      it('não deve obter o perfil sem token de autenticação', (done) => {
        chai.request(app)
          .get('/api/users/profile')
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('Acesso negado. Nenhum token fornecido.');
            done();
          });
      });
    });

    describe('PUT /api/users/profile', () => {
      it('deve atualizar o perfil do usuário autenticado', (done) => {
        const updatedProfile = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          bio: faker.lorem.sentence(),
          profilePicture: faker.image.avatar()
        };

        chai.request(app)
          .put('/api/users/profile')
          .set('Authorization', `Bearer ${token}`)
          .send(updatedProfile)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('message').eql('Perfil atualizado com sucesso');
            done();
          });
      });

      it('não deve atualizar o perfil sem token de autenticação', (done) => {
        const updatedProfile = {
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          bio: faker.lorem.sentence(),
          profilePicture: faker.image.avatar()
        };

        chai.request(app)
          .put('/api/users/profile')
          .send(updatedProfile)
          .end((err, res) => {
            res.should.have.status(401);
            res.body.should.be.a('object');
            res.body.should.have.property('error').eql('Acesso negado. Nenhum token fornecido.');
            done();
          });
      });
    });
  });
});
