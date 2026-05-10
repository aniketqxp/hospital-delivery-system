export type BabySex =
  | 'Male'
  | 'Female'
  | 'Twins (1 Male, 1 Female)'
  | 'Twins (Both Male)'
  | 'Twins (Both Female)';

export type DeliveryType =
  | 'Full Term Normal Delivery'
  | 'Vacuum Delivery'
  | 'Cesarean Section';

export interface DeliveryRecord {
  id: string;
  serialNumber: string;
  patientName: string;
  patientAge: number;
  patientAddress: string;
  patientTaluka?: string;
  patientDistrict?: string;
  aadhaarLast4?: string;
  deliveryDate: Date;
  babySex: BabySex;
  deliveryType: DeliveryType;
  babyWeightKg?: number;
  hospitalName: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

// Fields the user supplies when creating a record.
// hospital, serial number, and audit fields are set automatically.
export type CreateDeliveryRecord = Omit<
  DeliveryRecord,
  'id' | 'serialNumber' | 'hospitalName' | 'createdAt' | 'updatedAt' | 'createdBy' | 'lastModifiedBy'
>;

export interface SearchFilters {
  patientName?: string;
  aadhaarLast4?: string;
  serialNumber?: string;
  deliveryDate?: string;
  babySex?: string;
  deliveryType?: string;
}
