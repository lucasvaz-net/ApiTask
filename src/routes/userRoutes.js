const express = require('express');
const { register, login, getProfile, updateProfile } = require('../controllers/userController');
const { authenticate } = require('../middlewares/authenticate');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
