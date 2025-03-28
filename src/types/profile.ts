
export interface Profile {
  wallet_address?: string;
  college_verified?: boolean;
  is_admin?: boolean;
  is_super_admin?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  bio: string | null;
  position: string | null;
  photo_url: string | null;
  verified: boolean;
  votes_count: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}
