export type ExtensionStatus = 'active' | 'inactive';

export interface Extension {
  id: string;
  name: string;
  country: string;
  city: string;
  address: string;
  phone?: string;
  email?: string;
  pastor: string;
  latitude?: number;
  longitude?: number;
  status: ExtensionStatus;
  createdAt: string;
  updatedAt: string;
}
