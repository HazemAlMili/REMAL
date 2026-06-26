export interface AreaResponse {
  id: string; // or number? Usually string/GUID in C# APIs or int? Let's check api reference or assume string for standard UI, but wait. If it's 0001_init_postgres_conventions, IDs are uuid or serial. Let's use string.
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAreaRequest {
  name: string;
  description?: string;
}

export interface UpdateAreaRequest {
  name: string;
  description?: string;
}

export interface UpdateAreaStatusRequest {
  isActive: boolean;
}
