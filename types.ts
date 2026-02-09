
export enum SocialPlatform {
  X = 'X.CAPTURE',
  FACEBOOK = 'FB.NODE',
  INSTAGRAM = 'IG.VIBE',
  MEDIA = 'MEDIA.KIT',
  UNKNOWN = 'WEB.RAW'
}

export interface SocialInsight {
  id: string;
  sourceUrl?: string;
  mediaData?: string; // base64
  platform: SocialPlatform;
  summary: string;
  explanation: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyTakeaways: string[];
  timestamp: string;
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}
