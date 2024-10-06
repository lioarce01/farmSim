import express from 'express';
import users from './users';
import store from './store';
import seeds from './seeds';
import farm from './farm';

const router = express.Router();

router.use('/users', users);
router.use('/store', store);
router.use('/seeds', seeds);
router.use('/farm', farm);

export default router;
