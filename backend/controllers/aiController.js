const OpenAI = require('openai');

// Initialize OpenAI client with DeepSeek API
const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

const systemPrompt = `You are CipherGate AI, an expert on the CipherGate attendance and workforce management platform. Your role is to provide helpful, professional answers about CipherGate features and benefits.

Important rules:
- Only discuss CipherGate features and capabilities
- Use professional, enterprise-friendly language
- Keep responses concise and clear
- Do not discuss internal technical details, security implementations, or code
- Do not access or mention any real user data
- Focus on marketing and product explanation only
- Be confident and helpful

CipherGate is an advanced attendance management solution with biometric tracking for modern enterprises. It provides accurate employee presence monitoring and streamlines workforce management. Features include facial recognition, RFID attendance, GPS location verification, task management, and automated salary calculations.`;

const askCipherGateAI = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }v        

    // Prepare messages for the API call
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const completion = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: messages,
      temperature: 0.7,
      max_tokens: 500,
      stream: false
    });

    const response = completion.choices[0].message.content;

    res.json({
      response: response,
      success: true
    });

  } catch (error) {
    console.error('Error with DeepSeek API:', error);
    res.status(500).json({
      error: 'Failed to get response from AI',
      details: error.message
    });
  }
}; 

module.exports = { askCipherGateAI };