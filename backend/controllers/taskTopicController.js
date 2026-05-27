const TaskTopic = require('../models/TaskTopic');

// Get all topics for a subdomain
exports.getTopics = async (req, res) => {
  try {
    const { subdomain } = req.query;
    if (!subdomain) return res.status(400).json({ message: 'Subdomain is required' });

    const topics = await TaskTopic.find({ subdomain }).populate('department', 'name');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create a new topic
exports.createTopic = async (req, res) => {
  try {
    const { topicName, points, department, isAllDepartments, subTopics, subdomain } = req.body;
    if (!subdomain) return res.status(400).json({ message: 'Subdomain is required' });

    const newTopic = new TaskTopic({
      topicName,
      points: points || 0,
      department: isAllDepartments ? null : department,
      isAllDepartments: !!isAllDepartments,
      subTopics: subTopics || [],
      subdomain
    });

    const savedTopic = await newTopic.save();
    const populated = await savedTopic.populate('department', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a topic
exports.updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { topicName, points, department, isAllDepartments, subTopics } = req.body;

    const topic = await TaskTopic.findById(id);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    if (topicName) topic.topicName = topicName;
    if (points !== undefined) topic.points = points;
    if (isAllDepartments !== undefined) topic.isAllDepartments = isAllDepartments;
    if (topic.isAllDepartments) {
      topic.department = null;
    } else if (department !== undefined) {
      topic.department = department;
    }
    if (subTopics) topic.subTopics = subTopics;

    const updated = await topic.save();
    const populated = await updated.populate('department', 'name');
    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a topic
exports.deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    await TaskTopic.findByIdAndDelete(id);
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
