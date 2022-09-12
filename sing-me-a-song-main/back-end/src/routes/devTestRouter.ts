import Router from 'express';
import { reset, seed } from '../controllers/devTestController.js';

const devTestRouter = Router();

devTestRouter.delete('/reset', reset);
devTestRouter.post('/seed', seed);

export default devTestRouter;