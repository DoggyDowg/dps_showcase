import { Json } from './supabase';

export interface Agent {
  id: string;
  created_at: string;
  updated_at: string;
  agency_id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  avatar_url?: string;
  metadata: Record<string, Json>;
  status: 'active' | 'inactive';
}

export interface AgentAsset {
  type: 'image';
  url: string;
  name?: string;
  confidence: number;
}

export interface AgentAssets {
  images: AgentAsset[];
  agentDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
  };
} 