export interface Asset {
  id: number;
  type: string;
  symbol: string;
  name: string;
  quantity: number;
  avg_price: number;
  sector: string;
}

export interface Trade {
  id: number;
  asset_id: number;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  quantity: number;
  price: number;
  commission: number;
  mood: string;
  note: string;
  created_at: string;
  reason?: string;
  what_differently?: string;
  lesson?: string;
}

export interface AnxietyLog {
  id: number;
  level: number;
  event: string;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface Reaction {
  type: 'like' | 'handshake' | 'horror';
  count: number;
  user_reacted: boolean;
}

export interface UserProfile {
  id: number;
  username: string;
  assets: Asset[];
  posts: Post[];
  isSubscribed: boolean;
}

export interface Goal {
  id: number;
  title: string;
  target_value: number;
  current_value: number;
  type: string;
  is_completed: boolean;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}

export interface MarketSentiment {
  anxiety: number;
  reactions: { type: string; count: number }[];
}

export interface Post {
  id: number;
  user_id: number;
  username: string;
  content: string;
  is_trade_share: boolean;
  trade_id?: number;
  created_at: string;
  comments?: Comment[];
  reactions?: Reaction[];
}
