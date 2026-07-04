export type MediaType = 'video' | 'audio' | 'image' | 'document';

export type TestimonyStatus = 'pending' | 'approved' | 'rejected';

export interface Department {
  id: string;
  name: string;
  description?: string;
  leader?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Gallery {
  id: string;
  title: string;
  type: MediaType;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface Testimony {
  id: string;
  fullname: string;
  content: string;
  status: TestimonyStatus;
  createdAt: string;
  updatedAt: string;
}
