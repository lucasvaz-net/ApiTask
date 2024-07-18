const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Validation failed', details: errors.array() });
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gerenciamento de usuários
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuário registrado com sucesso
 *       400:
 *         description: Nome de usuário já existe
 */

exports.register = [
  body('username').isLength({ min: 5 }).withMessage('O nome de usuário deve ter pelo menos 5 caracteres'),
  body('email').isEmail().withMessage('E-mail inválido'),
  body('password').isLength({ min: 5 }).withMessage('A senha deve ter pelo menos 5 caracteres'),
  body('firstName').not().isEmpty().withMessage('O primeiro nome é obrigatório'),
  body('lastName').not().isEmpty().withMessage('O último nome é obrigatório'),
  validate,
  async (req, res, next) => {
    try {
      const { username, password, email, firstName, lastName } = req.body;
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ error: 'Nome de usuário já existe' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await User.create({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName
      });

      res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Nome de usuário ou senha incorretos
 */

exports.login = [
  body('username').not().isEmpty().withMessage('O nome de usuário é obrigatório'),
  body('password').not().isEmpty().withMessage('A senha é obrigatória'),
  validate,
  async (req, res, next) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(400).json({ error: 'Nome de usuário ou senha incorretos' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: 'Nome de usuário ou senha incorretos' });
      }

      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ token });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Obtém o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *       401:
 *         description: Acesso negado. Nenhum token fornecido.
 */

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *               bio:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil atualizado com sucesso
 *       401:
 *         description: Acesso negado. Nenhum token fornecido.
 */

exports.updateProfile = [
  body('email').optional().isEmail().withMessage('E-mail inválido'),
  body('firstName').optional().not().isEmpty().withMessage('O primeiro nome é obrigatório'),
  body('lastName').optional().not().isEmpty().withMessage('O último nome é obrigatório'),
  validate,
  async (req, res, next) => {
    try {
      const { firstName, lastName, email, bio, profilePicture } = req.body;
      const user = await User.findByPk(req.user.id);

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      user.firstName = firstName || user.firstName;
      user.lastName = lastName || user.lastName;
      user.email = email || user.email;
      user.bio = bio || user.bio;
      user.profilePicture = profilePicture || user.profilePicture;

      await user.save();

      res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }
];
