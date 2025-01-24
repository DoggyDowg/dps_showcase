declare global {
  interface Window {
    difyChatbotConfig?: DifyChatbotConfig;
    e?: () => void;
  }
}

export interface DifyChatbotConfig {
  token: string;
  containerProps?: {
    style?: {
      [key: string]: string;
    };
    className?: string;
    children?: string;
  };
  draggable?: boolean;
  dragAxis?: 'both' | 'x' | 'y';
  dynamicScript?: boolean;
  isDev?: boolean;
  baseUrl?: string;
  inputs?: {
    [key: string]: string;
  };
} 