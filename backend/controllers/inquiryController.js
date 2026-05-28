const Inquiry = require('../models/Inquiry');

exports.createInquiry = async (req, res) => {
  try {
    const { firstName, lastName, email, message } = req.body;
    const inquiry = new Inquiry({ firstName, lastName, email, message });
    await inquiry.save();
    res.status(201).json({ success: true, data: inquiry });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: inquiries });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
