export type ActivityType = 'qr' | 'photo' | 'location';

export interface EcoActivity {
  id: string;
  type: ActivityType;
  date: string;
  title?: string;
  description?: string;
  data?: string;
  image?: {
    webPath?: string;
    format?: string;
  };
  coords?: {
    latitude: number;
    longitude: number;
  };
}