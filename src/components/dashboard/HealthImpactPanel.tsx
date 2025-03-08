import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Progress } from "../ui/progress";
import { Activity, Heart, BookOpen, Leaf, ArrowUpRight, Send } from "lucide-react";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface HealthMetric {
  title: string;
  value: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface EducationalResource {
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  motion: string;
  AIdescription: string;
  type: string;
}

interface HealthImpactPanelProps {
  metrics?: HealthMetric[];
  resources?: EducationalResource[];
  communityImpact?: string;
}

const HealthImpactPanel = ({
  metrics = [
    {
      title: "Air Quality Improvement",
      value: 68,
      target: 100,
      unit: "%",
      icon: <Leaf className="h-5 w-5" />,
      color: "bg-green-500",
    },
    {
      title: "Reduced Respiratory Issues",
      value: 42,
      target: 100,
      unit: "%",
      icon: <Activity className="h-5 w-5" />,
      color: "bg-blue-500",
    },
    {
      title: "Holistic Community Health Score",
      value: 78,
      target: 100,
      unit: "%",
      icon: <Heart className="h-5 w-5" />,
      color: "bg-red-500",
    },
  ],
  resources = [
    {
      title: "Waste Management and Health",
      description:
        "Learn how proper waste management impacts community health outcomes.",
      imageUrl:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=80",
      link: "#",
      motion: "Environmental Health Assistant",
      AIdescription: "Ask questions about environmental health impacts",
      type: "Waste management AI",
    },
    {
      title: "Recycling Best Practices",
      description:
        "Discover the most effective ways to recycle different materials.",
      imageUrl:
        "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=600&q=80",
      link: "#",
      motion: "Recycling Assistant",
      AIdescription: "Get guidance on proper recycling techniques and material sorting",
      type: "Recycling AI",
    },
    {
      title: "Environmental Health Guide",
      description:
        "Understand how environmental factors affect your health and wellbeing.",
      imageUrl:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
      link: "#",
      motion: "Health Impact Assistant",
      AIdescription: "Learn about connections between environment and personal health",
      type: "Environmental Health AI",
    },
  ],
  communityImpact = "Your recycling efforts have contributed to a 23% reduction in waste-related illnesses in your community over the past year.",
}: HealthImpactPanelProps) => {
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyAUnznyJdjIevLpD_UPB7NURYXMnjDgd_M";
  
  // Separate state for each Gemini AI instance
  const [wasteInput, setWasteInput] = useState('');
  const [recyclingInput, setRecyclingInput] = useState('');
  const [environmentalInput, setEnvironmentalInput] = useState('');
  
  const [wasteMessages, setWasteMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your waste management AI assistant. Ask me about proper waste disposal, health impacts of waste, or community waste reduction programs.'
    }
  ]);
  
  const [recyclingMessages, setRecyclingMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your recycling AI assistant. Ask me about sorting recyclables, recycling best practices, or finding recycling centers near you.'
    }
  ]);
  
  const [environmentalMessages, setEnvironmentalMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: 'Hello! I\'m your environmental health AI assistant. Ask me about pollution impacts, environmental health threats, or creating healthier living spaces.'
    }
  ]);
  
  const [wasteGenerating, setWasteGenerating] = useState(false);
  const [recyclingGenerating, setRecyclingGenerating] = useState(false);
  const [environmentalGenerating, setEnvironmentalGenerating] = useState(false);
  
  // Refs for scrolling
  const wasteMessagesEndRef = useRef<HTMLDivElement>(null);
  const recyclingMessagesEndRef = useRef<HTMLDivElement>(null);
  const environmentalMessagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll for each instance
  useEffect(() => {
    wasteMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [wasteMessages]);
  
  useEffect(() => {
    recyclingMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [recyclingMessages]);
  
  useEffect(() => {
    environmentalMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [environmentalMessages]);

  // Handle form submission for waste management AI
  const handleWasteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wasteInput.trim() || wasteGenerating) return;

    // Add user message to the conversation
    const userMessage: Message = { role: 'user', content: wasteInput };
    setWasteMessages(prev => [...prev, userMessage]);
    setWasteInput('');
    setWasteGenerating(true);

    try {
      // Prepare the request data
      const requestData = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Focus on waste management health impacts and safe disposal techniques. ${wasteInput}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
      const data = await response.json();
      
      // Extract the response text
      let responseText = '';
      if (data.candidates && data.candidates[0]?.content?.parts) {
        responseText = data.candidates[0].content.parts[0].text || '';
      }

      // Add the assistant response to messages
      setWasteMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setWasteMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while generating a response. Please try again.' }
      ]);
    } finally {
      setWasteGenerating(false);
    }
  };

  // Handle form submission for recycling AI
  const handleRecyclingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recyclingInput.trim() || recyclingGenerating) return;

    // Add user message to the conversation
    const userMessage: Message = { role: 'user', content: recyclingInput };
    setRecyclingMessages(prev => [...prev, userMessage]);
    setRecyclingInput('');
    setRecyclingGenerating(true);

    try {
      // Prepare the request data
      const requestData = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Focus on recycling best practices and material sorting information. ${recyclingInput}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
      const data = await response.json();
      
      // Extract the response text
      let responseText = '';
      if (data.candidates && data.candidates[0]?.content?.parts) {
        responseText = data.candidates[0].content.parts[0].text || '';
      }

      // Add the assistant response to messages
      setRecyclingMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setRecyclingMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while generating a response. Please try again.' }
      ]);
    } finally {
      setRecyclingGenerating(false);
    }
  };

  // Handle form submission for environmental health AI
  const handleEnvironmentalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!environmentalInput.trim() || environmentalGenerating) return;

    // Add user message to the conversation
    const userMessage: Message = { role: 'user', content: environmentalInput };
    setEnvironmentalMessages(prev => [...prev, userMessage]);
    setEnvironmentalInput('');
    setEnvironmentalGenerating(true);

    try {
      // Prepare the request data
      const requestData = {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `Focus on environmental factors affecting human health and wellbeing. ${environmentalInput}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      };

      const response = await fetch(`${API_URL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) throw new Error(`API responded with status: ${response.status}`);
      const data = await response.json();
      
      // Extract the response text
      let responseText = '';
      if (data.candidates && data.candidates[0]?.content?.parts) {
        responseText = data.candidates[0].content.parts[0].text || '';
      }

      // Add the assistant response to messages
      setEnvironmentalMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Error generating response:', error);
      setEnvironmentalMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error while generating a response. Please try again.' }
      ]);
    } finally {
      setEnvironmentalGenerating(false);
    }
  };

  return (
    <div className="w-full bg-white p-4 rounded-xl shadow-sm">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">Health Impact</h2>
        <p className="text-gray-600 text-sm mt-1">{communityImpact}</p>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="overflow-hidden border-none shadow-md">
            <CardHeader className="p-3 pb-1">
              <div className="flex justify-between items-center">
                <div className={`p-1.5 rounded-full ${metric.color}`}>
                  {metric.icon}
                </div>
                <span className="text-xl font-bold">
                  {metric.value}{metric.unit}
                </span>
              </div>
              <CardTitle className="text-base mt-1">{metric.title}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{metric.value}/{metric.target}{metric.unit}</span>
                </div>
                <Progress value={(metric.value / metric.target) * 100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Educational Resources */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <BookOpen className="mr-2 h-4 w-4" />
          Health Education Resources
        </h3>
        <div className="grid grid-cols-1 gap-6">
          {/* Waste Management AI */}
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="col-span-1">
                <div className="h-40 overflow-hidden">
                  <img
                    src={resources[0].imageUrl}
                    alt={resources[0].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <CardTitle className="text-base">{resources[0].title}</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {resources[0].description}
                  </CardDescription>
                  <a
                    href={resources[0].link}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-medium mt-2"
                  >
                    Learn more <ArrowUpRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="col-span-2">
                <Card className="h-full overflow-hidden border-none shadow-md">
                  <CardHeader className="bg-green-50 p-3 pb-2">
                    <div className="flex items-center">
                      <Leaf className="h-5 w-5 text-green-600 mr-2" />
                      <CardTitle className="text-lg">{resources[0].motion}</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {resources[0].AIdescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="h-40 overflow-y-auto mb-3 rounded-md bg-gray-50 p-2 text-sm">
                      {wasteMessages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`mb-2 p-2 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-blue-100 ml-4 mr-1' 
                              : 'bg-green-100 mr-4 ml-1'
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-600 mb-0.5">
                            {message.role === 'user' ? 'You' : resources[0].type}
                          </div>
                          <div className="text-gray-800 text-sm">
                            {message.content}
                          </div>
                        </div>
                      ))}
                      
                      {wasteGenerating && (
                        <div className="mb-2 p-2 rounded-lg bg-green-100 mr-4 ml-1">
                          <div className="text-xs font-medium text-gray-600 mb-0.5">{resources[0].type}</div>
                          <div className="text-gray-800 flex items-center text-sm">
                            <div className="mr-2">Generating...</div>
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1.5 h-1.5 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={wasteMessagesEndRef} />
                    </div>

                    <form onSubmit={handleWasteSubmit} className="flex space-x-2">
                      <input
                        type="text"
                        value={wasteInput}
                        onChange={(e) => setWasteInput(e.target.value)}
                        placeholder="Ask about waste management..."
                        disabled={wasteGenerating}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
                      />
                      <button 
                        type="submit" 
                        disabled={wasteGenerating || !wasteInput.trim()}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {wasteGenerating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>

          {/* Recycling AI */}
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="col-span-1">
                <div className="h-40 overflow-hidden">
                  <img
                    src={resources[1].imageUrl}
                    alt={resources[1].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <CardTitle className="text-base">{resources[1].title}</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {resources[1].description}
                  </CardDescription>
                  <a
                    href={resources[1].link}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-medium mt-2"
                  >
                    Learn more <ArrowUpRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="col-span-2">
                <Card className="h-full overflow-hidden border-none shadow-md">
                  <CardHeader className="bg-blue-50 p-3 pb-2">
                    <div className="flex items-center">
                      <Leaf className="h-5 w-5 text-blue-600 mr-2" />
                      <CardTitle className="text-lg">{resources[1].motion}</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {resources[1].AIdescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="h-40 overflow-y-auto mb-3 rounded-md bg-gray-50 p-2 text-sm">
                      {recyclingMessages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`mb-2 p-2 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-blue-100 ml-4 mr-1' 
                              : 'bg-blue-50 mr-4 ml-1'
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-600 mb-0.5">
                            {message.role === 'user' ? 'You' : resources[1].type}
                          </div>
                          <div className="text-gray-800 text-sm">
                            {message.content}
                          </div>
                        </div>
                      ))}
                      
                      {recyclingGenerating && (
                        <div className="mb-2 p-2 rounded-lg bg-blue-50 mr-4 ml-1">
                          <div className="text-xs font-medium text-gray-600 mb-0.5">{resources[1].type}</div>
                          <div className="text-gray-800 flex items-center text-sm">
                            <div className="mr-2">Generating...</div>
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={recyclingMessagesEndRef} />
                    </div>

                    <form onSubmit={handleRecyclingSubmit} className="flex space-x-2">
                      <input
                        type="text"
                        value={recyclingInput}
                        onChange={(e) => setRecyclingInput(e.target.value)}
                        placeholder="Ask about recycling..."
                        disabled={recyclingGenerating}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <button 
                        type="submit" 
                        disabled={recyclingGenerating || !recyclingInput.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {recyclingGenerating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>

          {/* Environmental Health AI */}
          <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="col-span-1">
                <div className="h-40 overflow-hidden">
                  <img
                    src={resources[2].imageUrl}
                    alt={resources[2].title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3">
                  <CardTitle className="text-base">{resources[2].title}</CardTitle>
                  <CardDescription className="mt-1 text-xs">
                    {resources[2].description}
                  </CardDescription>
                  <a
                    href={resources[2].link}
                    className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-medium mt-2"
                  >
                    Learn more <ArrowUpRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="col-span-2">
                <Card className="h-full overflow-hidden border-none shadow-md">
                  <CardHeader className="bg-purple-50 p-3 pb-2">
                    <div className="flex items-center">
                      <Heart className="h-5 w-5 text-purple-600 mr-2" />
                      <CardTitle className="text-lg">{resources[2].motion}</CardTitle>
                    </div>
                    <CardDescription className="text-xs">
                      {resources[2].AIdescription}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="h-40 overflow-y-auto mb-3 rounded-md bg-gray-50 p-2 text-sm">
                      {environmentalMessages.map((message, index) => (
                        <div 
                          key={index} 
                          className={`mb-2 p-2 rounded-lg ${
                            message.role === 'user' 
                              ? 'bg-blue-100 ml-4 mr-1' 
                              : 'bg-purple-50 mr-4 ml-1'
                          }`}
                        >
                          <div className="text-xs font-medium text-gray-600 mb-0.5">
                            {message.role === 'user' ? 'You' : resources[2].type}
                          </div>
                          <div className="text-gray-800 text-sm">
                            {message.content}
                          </div>
                        </div>
                      ))}
                      
                      {environmentalGenerating && (
                        <div className="mb-2 p-2 rounded-lg bg-purple-50 mr-4 ml-1">
                          <div className="text-xs font-medium text-gray-600 mb-0.5">{resources[2].type}</div>
                          <div className="text-gray-800 flex items-center text-sm">
                            <div className="mr-2">Generating...</div>
                            <div className="flex space-x-1">
                              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <div className="w-1.5 h-1.5 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={environmentalMessagesEndRef} />
                    </div>

                    <form onSubmit={handleEnvironmentalSubmit} className="flex space-x-2">
                      <input
                        type="text"
                        value={environmentalInput}
                        onChange={(e) => setEnvironmentalInput(e.target.value)}
                        placeholder="Ask about environmental health..."
                        disabled={environmentalGenerating}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                      <button 
                        type="submit" 
                        disabled={environmentalGenerating || !environmentalInput.trim()}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {environmentalGenerating ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default HealthImpactPanel;
