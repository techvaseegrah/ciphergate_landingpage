const express = require('express');
const router = express.Router();

const { 
  getWorkers, 
  createWorker, 
  getWorkerById, 
  updateWorker, 
  deleteWorker,
  getWorkerActivities,
  getAllWorkerActivities,
  submitTask,
  resetWorkerActivities,
  getPublicWorkers,
  generateId,
  getWorkerByRfid,
  downloadIdProof
} = require('../controllers/workerController');
const { protect, adminOnly, adminOrWorker } = require('../middleware/authMiddleware');
const { uploadIdProof } = require('../middleware/uploadMiddleware');

router.route('/').post(protect, adminOnly, uploadIdProof.single('idProofFile'), createWorker);
router.route('/all').post(protect, adminOrWorker, getWorkers);
router.route('/all-activities').get(protect, adminOnly, getAllWorkerActivities);
router.route('/submit-task').post(protect, adminOrWorker, submitTask);
router.route('/generate-id').get(protect, generateId);
router.route('/get-worker-by-rfid').post(getWorkerByRfid);

router.post('/public', getPublicWorkers);

router.route('/:id')
  .get(protect, getWorkerById)
  .put(protect, adminOnly, uploadIdProof.single('idProofFile'), updateWorker)
  .delete(protect, adminOnly, deleteWorker);

router.route('/:id/download-proof').get(protect, downloadIdProof);

router.route('/:id/activities')
  .get(protect, getWorkerActivities)
  .delete(protect, adminOnly, resetWorkerActivities);

module.exports = router;