const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getOverview
} = require('../controllers/workAllocationController');
const { protect, adminOrWorker } = require('../middleware/authMiddleware');

router.use(protect, adminOrWorker);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/overview', getOverview);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

module.exports = router;
