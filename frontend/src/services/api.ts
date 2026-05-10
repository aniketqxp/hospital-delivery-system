import { supabase } from '../lib/supabase';
import { DeliveryRecord, CreateDeliveryRecord, BabySex, DeliveryType, SearchFilters } from '@shared/types';

function toDeliveryRecord(row: any): DeliveryRecord {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    patientName: row.patient_name,
    patientAge: row.patient_age,
    patientAddress: row.patient_address,
    patientTaluka: row.patient_taluka ?? undefined,
    patientDistrict: row.patient_district ?? undefined,
    aadhaarLast4: row.aadhaar_last4 ?? undefined,
    deliveryDate: new Date(row.delivery_date),
    babySex: row.baby_sex as BabySex,
    deliveryType: row.delivery_type as DeliveryType,
    babyWeightKg: row.baby_weight_kg ?? undefined,
    hospitalName: (row.hospitals as any)?.name ?? '',
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    createdBy: row.created_by ?? '',
    lastModifiedBy: row.last_modified_by ?? '',
  };
}

export async function getAllDeliveries(): Promise<DeliveryRecord[]> {
  const { data, error } = await supabase
    .from('delivery_records')
    .select('*, hospitals(name)')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(toDeliveryRecord);
}

export async function createDelivery(
  delivery: CreateDeliveryRecord,
  hospitalId: string,
  userId: string
): Promise<DeliveryRecord> {
  const { data, error } = await supabase
    .from('delivery_records')
    .insert({
      hospital_id: hospitalId,
      patient_name: delivery.patientName,
      patient_age: delivery.patientAge,
      patient_address: delivery.patientAddress,
      patient_taluka: delivery.patientTaluka || null,
      patient_district: delivery.patientDistrict || null,
      aadhaar_last4: delivery.aadhaarLast4 || null,
      delivery_date: delivery.deliveryDate.toISOString(),
      baby_sex: delivery.babySex,
      delivery_type: delivery.deliveryType,
      baby_weight_kg: delivery.babyWeightKg ?? null,
      created_by: userId,
      last_modified_by: userId,
    })
    .select('*, hospitals(name)')
    .single();

  if (error) throw new Error(error.message);
  return toDeliveryRecord(data);
}

export async function getDeliveryById(id: string): Promise<DeliveryRecord> {
  const { data, error } = await supabase
    .from('delivery_records')
    .select('*, hospitals(name)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return toDeliveryRecord(data);
}

export async function updateDelivery(
  id: string,
  updates: CreateDeliveryRecord,
  userId: string
): Promise<DeliveryRecord> {
  const { data, error } = await supabase
    .from('delivery_records')
    .update({
      patient_name: updates.patientName,
      patient_age: updates.patientAge,
      patient_address: updates.patientAddress,
      patient_taluka: updates.patientTaluka || null,
      patient_district: updates.patientDistrict || null,
      aadhaar_last4: updates.aadhaarLast4 || null,
      delivery_date: updates.deliveryDate.toISOString(),
      baby_sex: updates.babySex,
      delivery_type: updates.deliveryType,
      baby_weight_kg: updates.babyWeightKg ?? null,
      last_modified_by: userId,
    })
    .eq('id', id)
    .select('*, hospitals(name)')
    .single();

  if (error) throw new Error(error.message);
  return toDeliveryRecord(data);
}

export async function deleteDelivery(id: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .delete()
    .eq('id', id);
  if (error) throw new Error(error.message);
}

export async function searchDeliveries(filters: SearchFilters): Promise<DeliveryRecord[]> {
  let query = supabase
    .from('delivery_records')
    .select('*, hospitals(name)')
    .order('delivery_date', { ascending: false });

  if (filters.patientName) {
    query = query.ilike('patient_name', `%${filters.patientName}%`);
  }
  if (filters.aadhaarLast4) {
    query = query.eq('aadhaar_last4', filters.aadhaarLast4);
  }
  if (filters.serialNumber) {
    query = query.eq('serial_number', filters.serialNumber);
  }
  if (filters.deliveryDate) {
    const start = new Date(filters.deliveryDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(filters.deliveryDate);
    end.setHours(23, 59, 59, 999);
    query = query
      .gte('delivery_date', start.toISOString())
      .lte('delivery_date', end.toISOString());
  }
  if (filters.babySex) {
    query = query.eq('baby_sex', filters.babySex);
  }
  if (filters.deliveryType) {
    query = query.eq('delivery_type', filters.deliveryType);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data ?? []).map(toDeliveryRecord);
}
