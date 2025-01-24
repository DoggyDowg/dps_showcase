interface AppInfo {
  title: string;
  description: string;
  copyright: string;
  privacy_policy: string;
  default_language: string;
}

// App configuration
export const APP_INFO: AppInfo = {
  title: 'Digital Property Showcase',
  description: 'Welcome to',
  copyright: 'AI-powered assistant - responses may not always be accurate',
  privacy_policy: '',
  default_language: 'en'
};

// Dify API configuration
export const DIFY_CONFIG = {
  APP_ID: 'oWkqJYCzBe3LGY7f', // Your Dify App ID
  APP_KEY: process.env.NEXT_PUBLIC_DIFY_API_KEY ?? '', // Your Dify API Key
  API_URL: 'https://api.dify.ai/v1', // Dify API base URL
};

// Chat configuration
export const CHAT_CONFIG = {
  initialMessage: "Hello! Interested in elevating your property marketing? You're looking at a live demonstration of our premium property showcase service for real estate agents. I'd be happy to walk you through how this could work for your listings.",
  inputPlaceholder: 'Type your message here...',
  maxInputLength: 1000,
} as const;

// UI configuration
export const UI_CONFIG = {
  // Chat window dimensions
  chatWindow: {
    width: 400,
    height: 600,
    minHeight: 400,
    maxHeight: '80vh',
  },
  
  // Animation durations (in ms)
  animations: {
    openDuration: 300,
    messageFade: 200,
  },
}; 