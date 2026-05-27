const express = require('express');
const router = express.Router();
const taskTopicController = require('../controllers/taskTopicController');

router.get('/', taskTopicController.getTopics);
router.post('/', taskTopicController.createTopic);
router.put('/:id', taskTopicController.updateTopic);
router.delete('/:id', taskTopicController.deleteTopic);

module.exports = router;
