import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader2, CheckCircle, X } from 'lucide-react'; // Import X icon
import { CampaignObjective, AdCreative, AdCopy } from '../types';

interface AIChatbotProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignDataUpdate: (data: Partial<CampaignData>) => void;
  campaignData: CampaignData;
}

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text?: string;
  type: 'text' | 'quick_replies' | 'images' | 'ad_copy' | 'summary';
  quickReplies?: { label: string; value: string }[];
  images?: AdCreative[];
  adCopies?: AdCopy[];
  campaignSummary?: CampaignData;
}

const objectives: CampaignObjective[] = [
  { id: 'website_traffic', title: 'Website Traffic', description: 'Send people to a destination like your website or app.', icon: null },
  { id: 'lead_generation', title: 'Lead Generation', description: 'Collect leads for your business or brand.', icon: null },
  { id: 'sales', title: 'Sales', description: 'Find people likely to purchase your products or services.', icon: null },
  { id: 'engagement', title: 'Engagement', description: 'Get more messages, video views, or post engagement.', icon: null },
];

const AIChatbot: React.FC<AIChatbotProps> = ({ isOpen, onClose, onCampaignDataUpdate, campaignData }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [currentBotState, setCurrentBotState] = useState('initial'); // Tracks bot's current question/state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const botAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"; // Placeholder
  const botName = "AdPilot AI";

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendBotMessage("Hello! I'm AdPilot AI, your personal campaign assistant. Let's create a new ad campaign. What's your main objective?", 'quick_replies', [
        { label: 'Website Traffic', value: 'website_traffic' },
        { label: 'Lead Generation', value: 'lead_generation' },
        { label: 'Sales', value: 'sales' },
        { label: 'Engagement', value: 'engagement' },
      ]);
      setCurrentBotState('ask_objective');
    }
  }, [isOpen, messages.length]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isBotTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendBotMessage = (text: string, type: Message['type'] = 'text', options?: any) => {
    setIsBotTyping(true);
    setTimeout(() => {
      const newMessage: Message = {
        id: Date.now().toString(),
        sender: 'bot',
        text,
        type,
        ...options,
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setIsBotTyping(false);
    }, 1000); // Simulate bot typing delay
  };

  const sendUserMessage = (text: string, type: Message['type'] = 'text') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      type,
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInputMessage('');
    processUserMessage(text);
  };

  const handleQuickReply = (value: string, label: string) => {
    sendUserMessage(label, 'text'); // Display the label as user's message
    processUserMessage(value); // Process the value internally
  };

  const processUserMessage = async (message: string) => {
    if (currentBotState === 'ask_objective') {
      const selectedObjective = objectives.find(obj => obj.id === message);
      if (selectedObjective) {
        onCampaignDataUpdate({ objective: selectedObjective.id });
        sendBotMessage(`Great! You've selected "${selectedObjective.title}". Now, please provide the website URL you want to promote.`, 'text');
        setCurrentBotState('ask_url');
      } else {
        sendBotMessage("I didn't quite get that. Please select one of the objectives or type your main goal.", 'quick_replies', {
          quickReplies: [
            { label: 'Website Traffic', value: 'website_traffic' },
            { label: 'Lead Generation', value: 'lead_generation' },
            { label: 'Sales', value: 'sales' },
            { label: 'Engagement', value: 'engagement' },
          ]
        });
      }
    } else if (currentBotState === 'ask_url') {
      if (message.startsWith('http://') || message.startsWith('https://')) {
        onCampaignDataUpdate({ adUrl: message });
        sendBotMessage("Thanks! I'm now analyzing your website to suggest images and ad copy. This might take a moment...", 'text');
        setIsBotTyping(true);
        setCurrentBotState('thinking_scrape');

        // Simulate scraping and AI generation
        await new Promise(resolve => setTimeout(resolve, 3000));
        const dummyImages: AdCreative[] = [
          { id: 'img1', imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isSelected: false },
          { id: 'img2', imageUrl: 'https://images.unsplash.com/photo-1504868584819-f8ed6d218fd5?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isSelected: false },
          { id: 'img3', imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', isSelected: false },
        ];
        const dummyCopies: AdCopy[] = [
          { headline: 'Boost Your Business Online!', primaryText: 'Reach new customers and grow your sales with our powerful AI-driven ad platform. Get started today!' },
          { headline: 'Unlock Your Ad Potential', primaryText: 'Transform your marketing with intelligent ad creation. Maximize ROI effortlessly.' },
        ];
        onCampaignDataUpdate({ selectedImage: dummyImages[0]?.imageUrl || null, adCopies: dummyCopies });

        setIsBotTyping(false);
        sendBotMessage("I've found some images from your site. Please select one:", 'images', { images: dummyImages });
        sendBotMessage("Here are some ad copy variations:", 'ad_copy', { adCopies: dummyCopies });
        sendBotMessage("Now, let's talk about your target audience. What age range are you targeting?", 'text');
        setCurrentBotState('ask_age_range');
      } else {
        sendBotMessage("That doesn't look like a valid URL. Please provide a full website URL (e.g., https://yourwebsite.com).", 'text');
      }
    } else if (currentBotState === 'ask_age_range') {
      const ageMatch = message.match(/(\d+)\s*-\s*(\d+)/);
      if (ageMatch) {
        const minAge = parseInt(ageMatch[1]);
        const maxAge = parseInt(ageMatch[2]);
        if (minAge >= 13 && maxAge <= 65 && minAge <= maxAge) {
          onCampaignDataUpdate({ ageRange: [minAge, maxAge] });
          sendBotMessage(`Got it! Targeting ages ${minAge}-${maxAge}. What are some interests your audience has? You can list a few, separated by commas.`, 'text');
          setCurrentBotState('ask_interests');
        } else {
          sendBotMessage("Please provide a valid age range between 13 and 65 (e.g., '25-45').", 'text');
        }
      } else {
        sendBotMessage("Please provide the age range in the format 'min-max' (e.g., '18-35').", 'text');
      }
    } else if (currentBotState === 'ask_interests') {
      const interestsArray = message.split(',').map(item => item.trim()).filter(item => item !== '');
      if (interestsArray.length > 0) {
        onCampaignDataUpdate({ interests: interestsArray });
        sendBotMessage("Excellent! We have your objective, URL, creative, copy, age range, and interests. Are you ready to review your campaign?", 'quick_replies', [
          { label: 'Yes, review my campaign', value: 'review_campaign' },
          { label: 'No, I want to change something', value: 'change_something' },
        ]);
        setCurrentBotState('ask_review');
      } else {
        sendBotMessage("Please list at least one interest.", 'text');
      }
    } else if (currentBotState === 'ask_review') {
      if (message === 'review_campaign') {
        sendBotMessage("Here's a summary of your campaign:", 'summary', { campaignSummary: campaignData });
        sendBotMessage("Does everything look good? Shall we launch your campaign?", 'quick_replies', [
          { label: 'Launch Campaign', value: 'launch_campaign' },
          { label: 'Start Over', value: 'start_over' },
        ]);
        setCurrentBotState('final_confirmation');
      } else if (message === 'change_something') {
        sendBotMessage("Okay, what would you like to change? You can tell me, or we can start over.", 'quick_replies', [
          { label: 'Start Over', value: 'start_over' },
        ]);
        setCurrentBotState('initial'); // Reset state for now
      }
    } else if (currentBotState === 'final_confirmation') {
      if (message === 'launch_campaign') {
        sendBotMessage("Great! Launching your campaign now... (This is a simulation)", 'text');
        // Simulate launch
        setTimeout(() => {
          sendBotMessage("Your campaign has been successfully launched!", 'text');
          setCurrentBotState('completed');
          onClose(); // Close chat after completion
        }, 2000);
      } else if (message === 'start_over') {
        setMessages([]);
        onCampaignDataUpdate({
          objective: null,
          ageRange: [18, 65],
          interests: [],
          adUrl: '',
          selectedImage: null,
          adCopies: [{ headline: '', primaryText: '' }],
        });
        sendBotMessage("Okay, let's start over. What's your main objective?", 'quick_replies', [
          { label: 'Website Traffic', value: 'website_traffic' },
          { label: 'Lead Generation', value: 'lead_generation' },
          { label: 'Sales', value: 'sales' },
          { label: 'Engagement', value: 'engagement' },
        ]);
        setCurrentBotState('ask_objective');
      }
    }
  };

  const handleImageSelect = (imageUrl: string) => {
    onCampaignDataUpdate({ selectedImage: imageUrl });
    sendUserMessage(`Selected image: ${imageUrl.substring(0, 30)}...`, 'text');
  };

  const handleCopySelect = (copy: AdCopy, index: number) => {
    const updatedCopies = [...campaignData.adCopies];
    updatedCopies[0] = copy; // For simplicity, always update the first variation
    onCampaignDataUpdate({ adCopies: updatedCopies });
    sendUserMessage(`Selected Ad Copy Variation ${index + 1}`, 'text');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-container rounded-lg shadow-xl flex flex-col z-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <img src={botAvatar} alt="Bot Avatar" className="w-8 h-8 rounded-full mr-3" />
          <h3 className="font-semibold text-primary-text dark:text-gray-100">{botName}</h3>
        </div>
        <button onClick={onClose} className="text-secondary-text hover:text-primary-text dark:text-gray-400 dark:hover:text-gray-100">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-end ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {msg.sender === 'bot' && (
                <img src={botAvatar} alt="Bot Avatar" className="w-8 h-8 rounded-full mr-2 flex-shrink-0" />
              )}
              <div className={`p-3 rounded-lg max-w-[75%] ${
                msg.sender === 'user'
                  ? 'bg-primary-brand text-white rounded-br-none dark:bg-blue-600'
                  : 'bg-gray-100 text-primary-text rounded-bl-none dark:bg-gray-700 dark:text-gray-100'
              }`}>
                {msg.type === 'text' && <p>{msg.text}</p>}
                {msg.type === 'quick_replies' && (
                  <>
                    <p className="mb-2">{msg.text}</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.quickReplies?.map((reply) => (
                        <button
                          key={reply.value}
                          onClick={() => handleQuickReply(reply.value, reply.label)}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800"
                        >
                          {reply.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
                {msg.type === 'images' && (
                  <>
                    <p className="mb-2">{msg.text}</p>
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {msg.images?.map((image) => (
                        <div
                          key={image.id}
                          className={`relative flex-shrink-0 w-24 h-24 rounded-md overflow-hidden cursor-pointer border-2 ${
                            campaignData.selectedImage === image.imageUrl
                              ? 'border-primary-brand ring-2 ring-primary-brand dark:border-blue-400 dark:ring-blue-400'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          onClick={() => handleImageSelect(image.imageUrl)}
                        >
                          <img src={image.imageUrl} alt="Ad Creative" className="w-full h-full object-cover" />
                          {campaignData.selectedImage === image.imageUrl && (
                            <div className="absolute inset-0 flex items-center justify-center bg-primary-brand bg-opacity-50 dark:bg-blue-800 dark:bg-opacity-50">
                              <CheckCircle size={24} className="text-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {msg.type === 'ad_copy' && (
                  <>
                    <p className="mb-2">{msg.text}</p>
                    <div className="space-y-3">
                      {msg.adCopies?.map((copy, index) => (
                        <div
                          key={index}
                          className={`p-3 border rounded-md cursor-pointer ${
                            campaignData.adCopies[0]?.headline === copy.headline && campaignData.adCopies[0]?.primaryText === copy.primaryText
                              ? 'border-primary-brand ring-2 ring-primary-brand dark:border-blue-400 dark:ring-blue-400'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          onClick={() => handleCopySelect(copy, index)}
                        >
                          <p className="font-semibold text-primary-text dark:text-gray-100">{copy.headline}</p>
                          <p className="text-sm text-secondary-text dark:text-gray-300">{copy.primaryText}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {msg.type === 'summary' && msg.campaignSummary && (
                  <>
                    <p className="mb-2 font-semibold">{msg.text}</p>
                    <div className="bg-white p-4 rounded-md shadow-sm text-sm dark:bg-gray-700">
                      <p className="mb-1"><span className="font-medium">Objective:</span> {objectives.find(o => o.id === msg.campaignSummary?.objective)?.title || 'N/A'}</p>
                      <p className="mb-1"><span className="font-medium">URL:</span> {msg.campaignSummary.adUrl || 'N/A'}</p>
                      <p className="mb-1"><span className="font-medium">Image:</span> {msg.campaignSummary.selectedImage ? 'Selected' : 'N/A'}</p>
                      <p className="mb-1"><span className="font-medium">Headline:</span> {msg.campaignSummary.adCopies[0]?.headline || 'N/A'}</p>
                      <p className="mb-1"><span className="font-medium">Primary Text:</span> {msg.campaignSummary.adCopies[0]?.primaryText || 'N/A'}</p>
                      <p className="mb-1"><span className="font-medium">Age Range:</span> {msg.campaignSummary.ageRange[0]}-{msg.campaignSummary.ageRange[1]}</p>
                      <p><span className="font-medium">Interests:</span> {msg.campaignSummary.interests.join(', ') || 'N/A'}</p>
                    </div>
                  </>
                )}
              </div>
              {msg.sender === 'user' && (
                <User size={24} className="ml-2 text-gray-500 flex-shrink-0" />
              )}
            </div>
          </div>
        ))}
        {isBotTyping && (
          <div className="flex justify-start">
            <div className="flex items-end">
              <img src={botAvatar} alt="Bot Avatar" className="w-8 h-8 rounded-full mr-2" />
              <div className="bg-gray-100 text-primary-text p-3 rounded-lg rounded-bl-none dark:bg-gray-700 dark:text-gray-100">
                <Loader2 className="animate-spin" size={20} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center">
        <input
          type="text"
          className="flex-1 p-3 border border-gray-300 rounded-md bg-input-background text-primary-text focus:outline-none focus:ring-2 focus:ring-primary-brand dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
          placeholder="Type your message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && inputMessage.trim() !== '') {
              sendUserMessage(inputMessage);
            }
          }}
          disabled={isBotTyping}
        />
        <button
          onClick={() => inputMessage.trim() !== '' && sendUserMessage(inputMessage)}
          className="ml-3 p-3 bg-primary-brand text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
          disabled={isBotTyping || inputMessage.trim() === ''}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default AIChatbot;
