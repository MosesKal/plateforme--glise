export interface PublicRadioStation {
  id: string;
  nameFr: string;
  nameEn: string | null;
  descriptionFr: string | null;
  descriptionEn: string | null;
  streamUrl: string;
  websiteUrl: string | null;
  coverImage: string | null;
}

export interface AdminRadioStation extends PublicRadioStation {
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RadioStationInput {
  nameFr: string;
  nameEn?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  streamUrl: string;
  websiteUrl?: string;
  coverImage?: string;
  isActive: boolean;
}

export interface RadioStreamTestResult {
  reachable: true;
  statusCode: number;
  contentType: string | null;
}
