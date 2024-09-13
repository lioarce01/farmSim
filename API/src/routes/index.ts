import express from 'express';
import users from './users'
import store from './store'
import seeds from './seeds'

const router = express.Router();

router.use('/users', users);
router.use('/store', store)
router.use('/seeds', seeds)

export default router
