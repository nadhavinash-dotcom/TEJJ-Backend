export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface VoiceTranscribeRequest {
  text: string;
  sourceLanguage: string;
}

export interface VoiceTranscribeResponse {
  originalText: string;
  englishText: string;
  keywords: string[];
  detectedLanguage?: string;
}

export interface DispatchAcceptRequest {
  job_id: string;
  worker_id: string;
}

export interface DispatchAcceptResponse {
  success: boolean;
  match_id?: string;
  already_matched?: boolean;
  message?: string;
}

export interface JobFeedFilter {
  lane?: number[];
  max_distance_km?: number;
  min_pay?: number;
  skills?: string[];
  page?: number;
  limit?: number;
}

export interface JobFeedItem {
  _id: string;
  job_title: string;
  primary_skill: string;
  pay_rate?: number;
  pay_type: string;
  shift_start_time?: string;
  shift_duration_hours?: number;
  number_of_openings: number;
  openings_filled: number;
  lane: number;
  distance_km: number;
  sups_score: number;
  market_rate_delta?: number;
  employer_property_type: string;
  employer_area_locality: string;
  employer_dignity_score: number;
  employer_gstin_verified: boolean;
  employer_uniform_provided?: boolean;
  employer_meals_provided?: boolean;
  expires_at?: string;
}
