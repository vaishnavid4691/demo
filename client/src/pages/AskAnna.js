import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Send, MessageCircle, User, Bot, Loader, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';

const AskAnna = () => {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: language === 'hi' 
        ? 'नमस्ते! मैं अन्ना हूं, आपकी खाद्य सुरक्षा सहायक। मैं आपको सामग्री की सुरक्षा, पोषण संबंधी सुझाव और खाना पकाने की जानकारी में मदद कर सकती हूं।'
        : language === 'mr'
        ? 'नमस्कार! मी अण्णा आहे, तुमची खाद्य सुरक्षा सहाय्यक. मी तुम्हाला घटकांची सुरक्षा, पोषण सुचना आणि स्वयंपाक माहिती मध्ये मदत करू शकते.'
        : 'Hello! I\'m Anna, your food safety assistant. I can help you with ingredient safety, nutritional advice, and cooking information.',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickQuestions = [
    {
      en: "Is this ingredient safe for pregnant women?",
      hi: "क्या यह सामग्री गर्भवती महिलाओं के लिए सुरक्षित है?",
      mr: "हा घटक गर्भवती महिलांसाठी सुरक्षित आहे का?"
    },
    {
      en: "How to store vegetables to keep them fresh?",
      hi: "सब्जियों को ताजा रखने के लिए कैसे स्टोर करें?",
      mr: "भाजीपाला ताजे ठेवण्यासाठी कसे साठवावे?"
    },
    {
      en: "What spices are good for immunity?",
      hi: "रोग प्रतिरोधक क्षमता के लिए कौन से मसाले अच्छे हैं?",
      mr: "रोगप्रतिकारक शक्तीसाठी कोणते मसाले चांगले आहेत?"
    },
    {
      en: "How to check if meat is fresh?",
      hi: "मांस ताजा है या नहीं कैसे चेक करें?",
      mr: "मांस ताजे आहे की नाही कसे तपासावे?"
    }
  ];

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // In a real app, this would go to your backend API
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/chat/ask-anna`, {
        message: inputMessage,
        language: language,
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      });

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date(),
        suggestions: response.data.suggestions || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Fallback response if API fails
      const fallbackResponses = {
        en: "I'm sorry, I'm having trouble connecting right now. Please try again later. In the meantime, always check FSSAI certification and expiry dates on food products!",
        hi: "मुझे खुशी है, मुझे अभी कनेक्ट करने में परेशानी हो रही है। कृपया बाद में पुनः प्रयास करें। इस बीच, हमेशा खाद्य उत्पादों पर FSSAI प्रमाणन और समाप्ति तिथियों की जांच करें!",
        mr: "मला माफ करा, मला आत्ता कनेक्ट करण्यात अडचण येत आहे. कृपया नंतर पुन्हा प्रयत्न करा. दरम्यान, खाद्य उत्पादांवर नेहमी FSSAI प्रमाणपत्र आणि कालबाह्यता तारखा तपासा!"
      };

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: fallbackResponses[language] || fallbackResponses.en,
        timestamp: new Date(),
        isError: true
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question) => {
    setInputMessage(question[language] || question.en);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content) => {
    // Simple formatting for better readability
    return content.split('\n').map((line, index) => (
      <p key={index} className={line.trim() ? 'mb-2' : 'mb-1'}>
        {line}
      </p>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <div className="bg-primary-600 text-white p-3 rounded-full">
            <MessageCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">{t('askAnna')}</h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Your AI-powered food safety assistant. Ask about ingredients, nutrition, storage tips, and more!
        </p>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 h-96 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3/4 ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isError
                    ? 'bg-danger-50 text-danger-800 border border-danger-200'
                    : 'bg-gray-100 text-gray-800'
                } rounded-lg p-3 shadow-sm`}
              >
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && (
                    <div className={`p-1 rounded-full ${message.isError ? 'bg-danger-200' : 'bg-primary-100'}`}>
                      <Bot className={`h-4 w-4 ${message.isError ? 'text-danger-600' : 'text-primary-600'}`} />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm">{formatMessage(message.content)}</div>
                    <div className={`text-xs mt-2 opacity-70 ${
                      message.type === 'user' ? 'text-right' : 'text-left'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="p-1 rounded-full bg-white bg-opacity-20">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* Suggestions from Anna */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-2">Suggestions:</p>
                    <div className="space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs">
                          <Lightbulb className="h-3 w-3 text-warning-600" />
                          <span>{suggestion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 rounded-lg p-3 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="p-1 rounded-full bg-primary-100">
                    <Bot className="h-4 w-4 text-primary-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Loader className="h-4 w-4 animate-spin text-primary-600" />
                    <span className="text-sm">Anna is thinking...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t('typeMessage')}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">{t('send')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-warning-600" />
          <span>Quick Questions</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleQuickQuestion(question)}
              className="text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
            >
              <span className="text-sm text-gray-700">
                {question[language] || question.en}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
          <div className="bg-success-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-success-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Food Safety</h3>
          <p className="text-gray-600 text-sm">Get advice on ingredient safety, storage, and expiry checking</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
          <div className="bg-primary-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Lightbulb className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Smart Recommendations</h3>
          <p className="text-gray-600 text-sm">Get personalized product and cooking suggestions</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
          <div className="bg-warning-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-warning-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Multi-language</h3>
          <p className="text-gray-600 text-sm">Chat in English, Hindi, or Marathi for better understanding</p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertTriangle className="h-5 w-5 text-warning-600 mt-0.5" />
          <div className="text-sm text-warning-800">
            <p className="font-medium mb-1">Disclaimer:</p>
            <p>
              Anna provides general food safety information and suggestions. For specific health concerns or allergies, 
              please consult with healthcare professionals. Always verify FSSAI certification and check expiry dates before purchasing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAnna;