const { body, param, validationResult } = require('express-validator');
const Task = require('../models/task');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 400;
    error.data = errors.array();
    return next(error);
  }
  next();
};

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Gerenciamento de tarefas
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Cria uma nova tarefa
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               assignedTo:
 *                 type: integer
 *               tags:
 *                 type: string
 *               attachments:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tarefa criada com sucesso
 *       400:
 *         description: Validação falhou
 */

exports.createTask = [
  body('title').notEmpty().withMessage('O título é obrigatório'),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Prioridade deve ser low, medium ou high'),
  validate,
  async (req, res, next) => {
    try {
      const { title, description, priority, dueDate, assignedTo, tags, attachments } = req.body;
      const userId = req.user.id;
      const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        userId,
        assignedTo,
        tags,
        attachments
      });
      res.status(201).json(task);
    } catch (error) {
      next(error);
    }
  }
];

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Obtém todas as tarefas do usuário autenticado
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tarefas do usuário
 */

exports.getTasks = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.findAll({ where: { userId } });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Obtém uma tarefa específica pelo ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarefa encontrada
 *       404:
 *         description: Tarefa não encontrada
 */

exports.getTaskById = [
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const task = await Task.findOne({ where: { id, userId: req.user.id } });
        if (!task) {
          return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        res.json(task);
      } catch (error) {
        next(error);
      }
    }
  ];
  

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Atualiza uma tarefa existente
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               priority:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               assignedTo:
 *                 type: integer
 *               tags:
 *                 type: string
 *               attachments:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tarefa atualizada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 */

  exports.updateTask = [
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    body('title').optional().notEmpty().withMessage('O título é obrigatório'),
    body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Prioridade deve ser low, medium ou high'),
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const { title, description, status, priority, dueDate, assignedTo, tags, attachments } = req.body;
        const task = await Task.findOne({ where: { id, userId: req.user.id } });
        if (!task) {
          return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        task.title = title || task.title;
        task.description = description || task.description;
        task.status = status || task.status;
        task.priority = priority || task.priority;
        task.dueDate = dueDate || task.dueDate;
        task.assignedTo = assignedTo || task.assignedTo;
        task.tags = tags || task.tags;
        task.attachments = attachments || task.attachments;
        await task.save();
        res.json(task);
      } catch (error) {
        next(error);
      }
    }
  ];
  
/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Deleta uma tarefa existente
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Tarefa deletada com sucesso
 *       404:
 *         description: Tarefa não encontrada
 */

  exports.deleteTask = [
    param('id').isInt().withMessage('ID deve ser um número inteiro'),
    validate,
    async (req, res, next) => {
      try {
        const { id } = req.params;
        const task = await Task.findOne({ where: { id, userId: req.user.id } });
        if (!task) {
          return res.status(404).json({ error: 'Tarefa não encontrada' });
        }
        await task.destroy();
        res.json({ message: 'Tarefa deletada com sucesso' });
      } catch (error) {
        next(error);
      }
    }
  ];
