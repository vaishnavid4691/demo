const express = require('express');
const OpenAI = require('openai');
const { body, validationResult } = require('express-validator');
const { db } = require('../config/firebase');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Chat with Anna AI assistant
router.post('/ask', authenticateToken, [
  body('message').notEmpty().trim(),
  body('language').optional().isIn(['en', 'hi', 'mr']),
  body('context').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, language = 'en', context = '' } = req.body;

    // Create system prompt based on language
    const systemPrompt = createSystemPrompt(language);

    // Create user prompt with context
    const userPrompt = createUserPrompt(message, context, language);

    // Get chat history for context
    const chatHistory = await getChatHistory(req.user.uid, 5);

    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: systemPrompt },
      ...chatHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: userPrompt }
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    });

    const aiResponse = completion.choices[0].message.content;

    // Save conversation to database
    await saveConversation(req.user.uid, message, aiResponse, language);

    res.json({
      message: 'Chat response generated successfully',
      response: aiResponse,
      language
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ error: 'Failed to generate response' });
  }
});

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const history = await getChatHistory(req.user.uid, parseInt(limit));

    res.json({
      history
    });

  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

// Clear chat history
router.delete('/history', authenticateToken, async (req, res) => {
  try {
    const chatRef = db.collection('chatHistory');
    const snapshot = await chatRef.where('userId', '==', req.user.uid).get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    res.json({
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Clear chat history error:', error);
    res.status(500).json({ error: 'Failed to clear chat history' });
  }
});

// Get product recommendations
router.post('/recommendations', authenticateToken, [
  body('category').optional().trim(),
  body('budget').optional().isFloat({ min: 0 }),
  body('preferences').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { category, budget, preferences = [] } = req.body;

    // Build query for products
    let query = db.collection('products');

    if (category) {
      query = query.where('category', '==', category);
    }

    const snapshot = await query.get();
    let products = [];

    snapshot.forEach(doc => {
      const product = { id: doc.id, ...doc.data() };
      
      // Filter by budget if specified
      if (budget && product.price > budget) {
        return;
      }

      // Filter by preferences if specified
      if (preferences.length > 0) {
        const productText = `${product.name} ${product.description}`.toLowerCase();
        const hasPreference = preferences.some(pref => 
          productText.includes(pref.toLowerCase())
        );
        if (!hasPreference) return;
      }

      products.push(product);
    });

    // Sort by price (lowest first)
    products.sort((a, b) => a.price - b.price);

    // Limit to top 10 recommendations
    products = products.slice(0, 10);

    res.json({
      recommendations: products,
      total: products.length
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Helper function to create system prompt
function createSystemPrompt(language) {
  const prompts = {
    en: `You are Anna, an AI assistant for BazaarSetu - a platform connecting street food vendors with suppliers. You help vendors with:

1. Product recommendations and sourcing
2. Health and safety guidelines
3. FSSAI compliance information
4. Pricing and quality advice
5. Best practices for food handling

Be helpful, informative, and supportive. Keep responses concise but comprehensive. If you don't know something, suggest where they can find more information.`,

    hi: `आप अन्ना हैं, बाजारसेतु के लिए एक AI सहायक - एक ऐसा प्लेटफॉर्म जो स्ट्रीट फूड वेंडर्स को आपूर्तिकर्ताओं से जोड़ता है। आप वेंडर्स की मदद करते हैं:

1. उत्पाद सिफारिशें और सोर्सिंग
2. स्वास्थ्य और सुरक्षा दिशानिर्देश
3. FSSAI अनुपालन जानकारी
4. मूल्य निर्धारण और गुणवत्ता सलाह
5. खाद्य हैंडलिंग के लिए सर्वोत्तम प्रथाएं

सहायक, जानकारीपूर्ण और सहायक बनें। प्रतिक्रियाएं संक्षिप्त लेकिन व्यापक रखें। यदि आप कुछ नहीं जानते हैं, तो सुझाव दें कि वे अधिक जानकारी कहां से प्राप्त कर सकते हैं।`,

    mr: `तुम्ही अन्ना आहात, बाजारसेतु साठी एक AI सहाय्यक - एक अशी प्लॅटफॉर्म जी स्ट्रीट फूड वेंडर्सना पुरवठादारांशी जोडते. तुम्ही वेंडर्सना मदत करता:

1. उत्पादने सूचना आणि सोर्सिंग
2. आरोग्य आणि सुरक्षा मार्गदर्शक तत्त्वे
3. FSSAI अनुपालन माहिती
4. किंमत आणि गुणवत्ता सल्ला
5. अन्न हाताळणीसाठी सर्वोत्तम पद्धती

सहाय्यक, माहितीपूर्ण आणि सहाय्यक व्हा. प्रतिसाद संक्षिप्त पण व्यापक ठेवा. जर तुम्हाला काही माहित नसेल तर सूचना द्या की त्यांना अधिक माहिती कुठून मिळू शकते.`
  };

  return prompts[language] || prompts.en;
}

// Helper function to create user prompt
function createUserPrompt(message, context, language) {
  let prompt = message;

  if (context) {
    const contextPrefix = {
      en: 'Context: ',
      hi: 'संदर्भ: ',
      mr: 'संदर्भ: '
    };
    prompt = `${contextPrefix[language] || contextPrefix.en}${context}\n\nUser: ${message}`;
  }

  return prompt;
}

// Helper function to get chat history
async function getChatHistory(userId, limit) {
  try {
    const chatRef = db.collection('chatHistory');
    const snapshot = await chatRef
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const history = [];
    snapshot.forEach(doc => {
      const chatData = doc.data();
      history.unshift({
        role: chatData.role,
        content: chatData.content,
        timestamp: chatData.createdAt
      });
    });

    return history;
  } catch (error) {
    console.error('Get chat history error:', error);
    return [];
  }
}

// Helper function to save conversation
async function saveConversation(userId, userMessage, aiResponse, language) {
  try {
    const chatRef = db.collection('chatHistory');
    
    // Save user message
    await chatRef.add({
      userId,
      role: 'user',
      content: userMessage,
      language,
      createdAt: new Date()
    });

    // Save AI response
    await chatRef.add({
      userId,
      role: 'assistant',
      content: aiResponse,
      language,
      createdAt: new Date()
    });

  } catch (error) {
    console.error('Save conversation error:', error);
  }
}

module.exports = router;