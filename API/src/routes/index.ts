import express from 'express';
import users from './users'
import store from './store'

const router = express.Router();

router.use('/users', users);
router.use('/store', store)


export default router;