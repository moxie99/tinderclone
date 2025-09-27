/**
 * Smart response system that generates contextual replies
 * based on user input to simulate realistic conversations
 */

interface ResponseContext {
  message: string;
  userInterests?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
}

// Response templates organized by context
const responseTemplates = {
  greetings: [
    "Hey! How's your day going? 😊",
    "Hi there! What's been keeping you busy?",
    "Hello! I'm excited to chat with you!",
    "Hey! I've been looking forward to this conversation!",
  ],
  
  questions: [
    "That's a great question! I'd love to hear more about your thoughts on that.",
    "Interesting perspective! What made you think about that?",
    "I'm curious about that too! What's your take on it?",
    "That's something I've been wondering about as well!",
  ],
  
  compliments: [
    "Aww, thank you! That's so sweet of you to say 💕",
    "You're too kind! That really means a lot to me",
    "That's so thoughtful of you! You seem really genuine",
    "Thank you! You seem like such a wonderful person",
  ],
  
  work: [
    "That sounds really interesting! What do you enjoy most about your work?",
    "I love hearing about people's careers! What got you into that field?",
    "That must be so rewarding! Do you have any exciting projects coming up?",
    "Work can be so fulfilling when you're passionate about it!",
  ],
  
  hobbies: [
    "That's so cool! I'd love to hear more about that hobby",
    "That sounds like such a fun way to spend time!",
    "I'm always impressed by people who pursue their passions!",
    "That's awesome! How did you get started with that?",
  ],
  
  travel: [
    "I love traveling too! What's been your favorite place so far?",
    "That sounds amazing! I'm always looking for new places to explore",
    "Travel is such a great way to experience different cultures!",
    "I'm so jealous! I'd love to visit there someday",
  ],
  
  food: [
    "I'm a total foodie too! What's your favorite type of cuisine?",
    "That sounds delicious! I'm always looking for new restaurants to try",
    "Food is such a great way to connect with people!",
    "I love trying new foods! What's the best meal you've had recently?",
  ],
  
  weekend: [
    "Weekends are the best! What are your favorite ways to relax?",
    "I love hearing about people's weekend plans!",
    "That sounds like such a fun way to spend your time off!",
    "Weekends are perfect for doing the things you love!",
  ],
  
  future: [
    "That's so exciting! I love hearing about people's goals and dreams",
    "It's so inspiring to hear about your plans!",
    "That sounds like such an amazing journey ahead!",
    "I'm excited to see where life takes you!",
  ],
  
  emotional: [
    "I really appreciate you sharing that with me",
    "That sounds like it was really meaningful to you",
    "I'm here to listen if you want to talk about it more",
    "Thank you for being so open with me",
  ],
  
  default: [
    "That's really interesting! Tell me more about that",
    "I'd love to hear more about your thoughts on that",
    "That sounds fascinating! What else can you tell me?",
    "I'm really enjoying our conversation!",
  ]
};

// Keywords to detect context
const keywordMappings = {
  greetings: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'],
  questions: ['?', 'what', 'how', 'why', 'when', 'where', 'who', 'which'],
  compliments: ['beautiful', 'gorgeous', 'handsome', 'cute', 'amazing', 'wonderful', 'great', 'awesome', 'love'],
  work: ['work', 'job', 'career', 'office', 'meeting', 'project', 'boss', 'colleague', 'company'],
  hobbies: ['hobby', 'sport', 'music', 'art', 'reading', 'gaming', 'photography', 'dancing', 'singing'],
  travel: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'beach', 'mountains', 'city', 'country'],
  food: ['food', 'restaurant', 'cooking', 'recipe', 'dinner', 'lunch', 'breakfast', 'coffee', 'pizza'],
  weekend: ['weekend', 'saturday', 'sunday', 'friday', 'relax', 'fun', 'party', 'friends'],
  future: ['future', 'goal', 'dream', 'plan', 'hope', 'wish', 'aspire', 'ambition'],
  emotional: ['feel', 'emotion', 'sad', 'happy', 'excited', 'nervous', 'worried', 'stressed', 'anxious']
};

/**
 * Analyzes the message content and determines the appropriate response category
 */
function analyzeMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  // Check for greetings first
  if (keywordMappings.greetings.some(keyword => lowerMessage.includes(keyword))) {
    return 'greetings';
  }
  
  // Check for questions
  if (keywordMappings.questions.some(keyword => lowerMessage.includes(keyword))) {
    return 'questions';
  }
  
  // Check for compliments
  if (keywordMappings.compliments.some(keyword => lowerMessage.includes(keyword))) {
    return 'compliments';
  }
  
  // Check other categories
  for (const [category, keywords] of Object.entries(keywordMappings)) {
    if (category === 'greetings' || category === 'questions' || category === 'compliments') continue;
    
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return category;
    }
  }
  
  return 'default';
}

/**
 * Gets the current time of day for contextual responses
 */
function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Generates a smart, contextual response based on the user's message
 */
export function generateSmartResponse(context: ResponseContext): string {
  const category = analyzeMessage(context.message);
  const templates = responseTemplates[category as keyof typeof responseTemplates] || responseTemplates.default;
  
  // Add time-based context for greetings
  if (category === 'greetings') {
    const timeOfDay = context.timeOfDay || getTimeOfDay();
    const timeBasedGreetings = {
      morning: ["Good morning! Hope you're having a great start to your day! ☀️", "Morning! What are your plans for today?"],
      afternoon: ["Good afternoon! How's your day going so far? 🌤️", "Afternoon! What's keeping you busy today?"],
      evening: ["Good evening! How was your day? 🌅", "Evening! What did you get up to today?"],
      night: ["Good evening! How was your day? 🌙", "Evening! What did you get up to today?"]
    };
    
    const timeTemplates = timeBasedGreetings[timeOfDay];
    const allTemplates = [...templates, ...timeTemplates];
    return allTemplates[Math.floor(Math.random() * allTemplates.length)];
  }
  
  // For other categories, add some variety based on message length
  let selectedTemplates = templates;
  
  if (context.message.length > 100) {
    // For longer messages, use more thoughtful responses
    const thoughtfulResponses = [
      "That's such a thoughtful message! I really appreciate you sharing that with me",
      "You've given me a lot to think about! That's really interesting",
      "I love how detailed you are! It shows you really care about this",
      "That's so well thought out! I'm really enjoying our conversation"
    ];
    selectedTemplates = [...templates, ...thoughtfulResponses];
  } else if (context.message.length < 20) {
    // For short messages, use more casual responses
    const casualResponses = [
      "Nice! 😊",
      "Cool!",
      "That's awesome!",
      "I like that!",
      "Sweet! 😄"
    ];
    selectedTemplates = [...templates, ...casualResponses];
  }
  
  return selectedTemplates[Math.floor(Math.random() * selectedTemplates.length)];
}

/**
 * Generates a follow-up question to keep the conversation going
 */
export function generateFollowUpQuestion(context: ResponseContext): string {
  const followUpQuestions = [
    "What's your favorite thing about that?",
    "How did you get into that?",
    "What's the most interesting part about it?",
    "What would you recommend to someone just starting out?",
    "What's your next goal with that?",
    "What's been your biggest challenge?",
    "What's the best advice you've received about that?",
    "What's something most people don't know about that?",
    "What's your favorite memory related to that?",
    "What's something you're looking forward to?"
  ];
  
  return followUpQuestions[Math.floor(Math.random() * followUpQuestions.length)];
}

/**
 * Generates a complete smart response with potential follow-up
 */
export function generateCompleteResponse(context: ResponseContext): string {
  const mainResponse = generateSmartResponse(context);
  const shouldAddFollowUp = Math.random() > 0.6; // 40% chance of follow-up
  
  if (shouldAddFollowUp) {
    const followUp = generateFollowUpQuestion(context);
    return `${mainResponse} ${followUp}`;
  }
  
  return mainResponse;
}
