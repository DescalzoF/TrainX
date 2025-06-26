import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { FaComments, FaTimes, FaSearch, FaRobot, FaUser, FaSpinner, FaQuestion, FaChevronDown } from 'react-icons/fa';
import './Chatbot.css';

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI('AIzaSyD1OQp8RlGAdPkjBXLzRCXJ3Zr5uLAbiCI');

function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isSuggestedQuestionsOpen, setIsSuggestedQuestionsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "¡Hola! Soy tu asistente de fitness. Puedo ayudarte con dudas sobre ejercicios, rutinas y recomendaciones personalizadas. ¿En qué puedo ayudarte hoy?",
            isBot: true,
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const [isLoadingUser, setIsLoadingUser] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    // Predetermined questions
    const suggestedQuestions = [
        "¿Cómo empezar una rutina de ejercicios?",
        "¿Qué ejercicios puedo hacer en casa?",
        "¿Cuántas veces a la semana debo entrenar?",
        "¿Cómo calcular mi IMC?",
        "Rutina para ganar músculo",
        "Ejercicios para bajar de peso",
        "¿Qué comer antes de entrenar?",
        "Ejercicios para mejorar la resistencia"
    ];

    // Scroll to bottom of messages
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Fetch user data when chatbot opens
    useEffect(() => {
        if (isOpen && !userData) {
            fetchUserData();
        }
    }, [isOpen]);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            setIsLoadingUser(true);
            const response = await axios.get('http://localhost:8080/api/profile/me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = response.data;
            setUserData({
                username: data.username || '',
                weight: data.weight || 0,
                height: data.height || 0,
                sex: data.sex || 'male',
                dateOfBirth: data.dateOfBirth || '',
                xpFitness: data.xpFitnessEntity?.xpTotal || 0,
                coins: data.coins || 0
            });
        } catch (err) {
            console.error('Error fetching user data:', err);
        } finally {
            setIsLoadingUser(false);
        }
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return null;
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const calculateBMI = () => {
        if (userData?.weight && userData?.height) {
            const heightInMeters = userData.height / 100;
            return (userData.weight / (heightInMeters * heightInMeters)).toFixed(1);
        }
        return null;
    };

    const createUserContext = () => {
        if (!userData) return '';

        const age = calculateAge(userData.dateOfBirth);
        const bmi = calculateBMI();

        return `Información del usuario:
- Nombre: ${userData.username}
- Peso: ${userData.weight} kg
- Altura: ${userData.height} cm
- Sexo: ${userData.sex === 'male' ? 'Hombre' : userData.sex === 'female' ? 'Mujer' : 'Otro'}
${age ? `- Edad: ${age} años` : ''}
${bmi ? `- IMC: ${bmi}` : ''}
- Experiencia en fitness (XP): ${userData.xpFitness}
- Nivel: ${userData.xpFitness < 1000 ? 'Principiante' : userData.xpFitness < 5000 ? 'Intermedio' : 'Avanzado'}`;
    };

    const sendMessage = async (messageText = null) => {
        const textToSend = messageText || inputMessage;
        if (!textToSend.trim()) return;

        const userMessage = {
            id: messages.length + 1,
            text: textToSend,
            isBot: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Use the correct model name for the current API
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            const userContext = createUserContext();
            const systemPrompt = `Eres un asistente de fitness experto y amigable. Tu objetivo es ayudar a los usuarios con dudas sobre ejercicios, rutinas y dar recomendaciones personalizadas.

${userContext}

Instrucciones:
- Responde en español
- Sé específico y práctico en tus recomendaciones
- Considera la información física del usuario para personalizar las respuestas
- Si no tienes información del usuario, da consejos generales
- Mantén un tono motivador y profesional
- Si la pregunta no está relacionada con fitness, redirige amablemente hacia temas de ejercicio
- Limita tus respuestas a 200 palabras máximo
- Incluye consejos de seguridad cuando sea relevante

Pregunta del usuario: ${textToSend}`;

            const result = await model.generateContent([systemPrompt]);
            const response = await result.response;
            const botResponse = response.text();

            const botMessage = {
                id: messages.length + 2,
                text: botResponse,
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (error) {
            console.error('Error sending message:', error);

            // Fallback response when API fails
            const fallbackMessage = {
                id: messages.length + 2,
                text: "Lo siento, no pude procesar tu consulta en este momento. Por favor, intenta nuevamente más tarde. Mientras tanto, recuerda mantener una rutina constante y escuchar a tu cuerpo.",
                isBot: true,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, fallbackMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuggestedQuestion = (question) => {
        sendMessage(question);
        setIsSuggestedQuestionsOpen(false); // Close the suggested questions after selecting one
    };

    const toggleSuggestedQuestions = () => {
        setIsSuggestedQuestionsOpen(!isSuggestedQuestionsOpen);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const toggleChatbot = () => {
        setIsOpen(!isOpen);
    };

    const formatTime = (timestamp) => {
        return timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="chatbot-container">
            {/* Chat Window */}
            {isOpen && (
                <div className="chatbot-window">
                    <div className="chatbot-header">
                        <div className="chatbot-title">
                            <FaRobot className="chatbot-icon" />
                            <span>Asistente de Fitness</span>
                            {isLoadingUser && <FaSpinner className="chatbot-loading-spinner" />}
                        </div>
                        <button className="chatbot-close" onClick={toggleChatbot}>
                            <FaTimes />
                        </button>
                    </div>

                    <div className="chatbot-messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`chatbot-message ${message.isBot ? 'chatbot-bot-message' : 'chatbot-user-message'}`}
                            >
                                <div className="chatbot-message-avatar">
                                    {message.isBot ? (
                                        <FaRobot className="chatbot-bot-avatar" />
                                    ) : (
                                        <FaUser className="chatbot-user-avatar" />
                                    )}
                                </div>
                                <div className="chatbot-message-content">
                                    <div className="chatbot-message-text">
                                        {message.text}
                                    </div>
                                    <div className="chatbot-message-time">
                                        {formatTime(message.timestamp)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-message chatbot-bot-message">
                                <div className="chatbot-message-avatar">
                                    <FaRobot className="chatbot-bot-avatar" />
                                </div>
                                <div className="chatbot-message-content">
                                    <div className="chatbot-message-text chatbot-typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggested Questions */}
                    <div className="chatbot-suggested-questions">
                        <div className="chatbot-suggested-questions-header" onClick={toggleSuggestedQuestions}>
                            <h4 className="chatbot-suggested-questions-title">
                                <FaQuestion />
                                Preguntas frecuentes
                            </h4>
                            <FaChevronDown
                                className={`chatbot-suggested-questions-toggle ${isSuggestedQuestionsOpen ? 'chatbot-expanded' : ''}`}
                            />
                        </div>
                        <div className={`chatbot-suggested-questions-content ${isSuggestedQuestionsOpen ? 'chatbot-expanded' : ''}`}>
                            <div className="chatbot-suggested-questions-list">
                                {suggestedQuestions.map((question, index) => (
                                    <button
                                        key={index}
                                        className="chatbot-suggested-question"
                                        onClick={() => handleSuggestedQuestion(question)}
                                        disabled={isLoading}
                                    >
                                        {question}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="chatbot-input">
                        <div className="chatbot-input-container">
                            <textarea
                                ref={inputRef}
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Pregúntame sobre consejos de fitness..."
                                className="chatbot-message-input"
                                rows="1"
                                disabled={isLoading}
                            />
                            <button
                                onClick={() => sendMessage()}
                                disabled={!inputMessage.trim() || isLoading}
                                className="chatbot-search-button"
                            >
                                {isLoading ? <FaSpinner className="chatbot-loading-spinner" /> : <FaSearch />}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                className={`chatbot-toggle ${isOpen ? 'chatbot-active' : ''}`}
                onClick={toggleChatbot}
            >
                {isOpen ? <FaTimes /> : <FaQuestion />}
                <span className="chatbot-badge">
                    {isOpen ? 'Cerrar' : 'Ayuda'}
                </span>
            </button>
        </div>
    );
}

export default Chatbot;