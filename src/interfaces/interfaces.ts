export interface ApiResponse<T> {
  status: boolean;
  message: string;
  data?: T;
  error?: string | null;
}

export interface User {}

export interface userToken {}

export interface CacheManagerOptions {
  store?: string;
  ttl?: number;
  max?: number;
  isCacheableValue?: (value: any) => boolean;
}
