const mongoose = require('mongoose');

const subTopicSchema = new mongoose.Schema({
  title: { type: String, required: true }
});

const taskTopicSchema = new mongoose.Schema({
  topicName: { type: String, required: true },
  points: { type: Number, default: 0 },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  isAllDepartments: { type: Boolean, default: false },
  subTopics: [subTopicSchema],
  subdomain: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TaskTopic', taskTopicSchema);
