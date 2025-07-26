const express = require('express');
const router = express.Router();

// Mock OpenAI responses since we don't have API key in demo
const mockResponses = {
  en: {
    "ingredient safety": "Always check FSSAI certification and expiry dates. Look for proper storage conditions and avoid damaged packaging.",
    "storage tips": "Store vegetables in cool, dry places. Keep fruits separate from vegetables. Use airtight containers for spices.",
    "spices immunity": "Turmeric, ginger, garlic, and black pepper are excellent for boosting immunity. Use them regularly in cooking.",
    "meat freshness": "Fresh meat should be firm, have a bright color, and no foul smell. Check the temperature and packaging date.",
    "default": "I'm here to help with food safety, ingredient storage, and cooking tips. Feel free to ask about FSSAI certification, expiry dates, or nutritional advice!"
  },
  hi: {
    "ingredient safety": "हमेशा FSSAI प्रमाणन और समाप्ति तिथियों की जांच करें। उचित भंडारण स्थितियों की तलाश करें और क्षतिग्रस्त पैकेजिंग से बचें।",
    "storage tips": "सब्जियों को ठंडी, सूखी जगह पर रखें। फलों को सब्जियों से अलग रखें। मसालों के लिए एयरटाइट कंटेनर का उपयोग करें।",
    "spices immunity": "हल्दी, अदरक, लहसुन, और काली मिर्च रोग प्रतिरोधक क्षमता बढ़ाने के लिए उत्कृष्ट हैं। इन्हें नियमित रूप से खाना पकाने में उपयोग करें।",
    "meat freshness": "ताजा मांस मजबूत होना चाहिए, चमकदार रंग होना चाहिए, और कोई दुर्गंध नहीं होनी चाहिए। तापमान और पैकेजिंग तिथि की जांच करें।",
    "default": "मैं खाद्य सुरक्षा, सामग्री भंडारण और खाना पकाने की युक्तियों में मदद के लिए यहां हूं। FSSAI प्रमाणन, समाप्ति तिथियों, या पोषण सलाह के बारे में बेझिझक पूछें!"
  },
  mr: {
    "ingredient safety": "नेहमी FSSAI प्रमाणन आणि कालबाह्यता तारखा तपासा. योग्य स्टोरेज परिस्थिती शोधा आणि खराब झालेल्या पॅकेजिंगपासून टाळा.",
    "storage tips": "भाजीपाला थंड, कोरड्या ठिकाणी ठेवा. फळे भाजीपाल्यापासून वेगळी ठेवा. मसाल्यांसाठी हवाबंद डब्बे वापरा.",
    "spices immunity": "हळद, आले, लसूण आणि काळी मिरी रोगप्रतिकारक शक्ती वाढवण्यासाठी उत्कृष्ट आहेत. स्वयंपाकात नियमितपणे वापरा.",
    "meat freshness": "ताजे मांस घट्ट असावे, चमकदार रंग असावा आणि वाईट वास नसावा. तापमान आणि पॅकेजिंग तारीख तपासा.",
    "default": "मी खाद्य सुरक्षा, घटकांचे संचयन आणि स्वयंपाकाच्या टिप्समध्ये मदत करण्यासाठी येथे आहे. FSSAI प्रमाणन, कालबाह्यता तारखा किंवा पोषण सल्ल्याविषयी मोकळेपणाने विचारा!"
  }
};

// Ask Anna chat endpoint
router.post('/ask-anna', async (req, res) => {
  try {
    const { message, language = 'en', conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Simple keyword matching for mock responses
    const messageLower = message.toLowerCase();
    let responseKey = 'default';
    
    if (messageLower.includes('safe') || messageLower.includes('safety') || messageLower.includes('सुरक्षा') || messageLower.includes('सुरक्षित')) {
      responseKey = 'ingredient safety';
    } else if (messageLower.includes('store') || messageLower.includes('storage') || messageLower.includes('रखें') || messageLower.includes('ठेवा')) {
      responseKey = 'storage tips';
    } else if (messageLower.includes('spice') || messageLower.includes('immunity') || messageLower.includes('मसाले') || messageLower.includes('रोग प्रतिरोधक')) {
      responseKey = 'spices immunity';
    } else if (messageLower.includes('meat') || messageLower.includes('chicken') || messageLower.includes('fresh') || messageLower.includes('मांस') || messageLower.includes('ताजा')) {
      responseKey = 'meat freshness';
    }

    const responses = mockResponses[language] || mockResponses.en;
    const response = responses[responseKey] || responses.default;

    // Generate suggestions based on the topic
    const suggestions = [];
    if (responseKey === 'ingredient safety') {
      suggestions.push('Check FSSAI license numbers');
      suggestions.push('Verify expiry dates');
      suggestions.push('Look for proper packaging');
    } else if (responseKey === 'storage tips') {
      suggestions.push('Use refrigeration when needed');
      suggestions.push('Keep items in dry conditions');
      suggestions.push('Separate different food types');
    }

    res.json({
      response,
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      error: 'Failed to process chat message',
      message: error.message 
    });
  }
});

// Get chat suggestions
router.get('/suggestions', (req, res) => {
  const { language = 'en' } = req.query;
  
  const suggestions = {
    en: [
      "How to check if ingredients are safe?",
      "Best storage practices for vegetables",
      "FSSAI certification importance",
      "Signs of food spoilage",
      "Spices for boosting immunity"
    ],
    hi: [
      "सामग्री सुरक्षित है या नहीं कैसे जांचें?",
      "सब्जियों के लिए सबसे अच्छी भंडारण प्रथाएं",
      "FSSAI प्रमाणन का महत्व",
      "खराब होने के संकेत",
      "रोग प्रतिरोधक क्षमता बढ़ाने के लिए मसाले"
    ],
    mr: [
      "घटक सुरक्षित आहेत की नाही हे कसे तपासावे?",
      "भाजीपाल्यासाठी सर्वोत्तम साठवण प्रथा",
      "FSSAI प्रमाणनाचे महत्त्व",
      "खराब होण्याची चिन्हे",
      "रोगप्रतिकारक शक्ती वाढवण्यासाठी मसाले"
    ]
  };

  res.json({
    suggestions: suggestions[language] || suggestions.en
  });
});

module.exports = router;