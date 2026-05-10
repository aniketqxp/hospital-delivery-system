import { supabase } from '../lib/supabase';
import { DeliveryRecord, CreateDeliveryRecord, BabySex, DeliveryType, SearchFilters } from '@shared/types';

// Translate Supabase / PostgREST errors to messages a hospital staffer can act on.
function humanizeError(error: unknown): Error {
  if (!error) return new Error('Unknown error');
  const e = error as { code?: string; message?: string; name?: string };
  const msg = e.message ?? '';

  if (e.code === 'PGRST116') return new Error('Record not found.');
  if (msg.includes('JWT expired') || msg.includes('Invalid Refresh Token') || e.code === 'PGRST301') {
    return new Error('Your session has expired. Please sign in again.');
  }
  if (msg === 'Failed to fetch' || e.name === 'TypeError') {
    return new Error('Network error — please check your connection and try again.');
  }
  return new Error(msg || 'Something went wrong.');
}

// Postgres ilike treats %, _, and \ as wildcards. User input must escape them
// or a search for "50%" returns rows containing the string "50" followed by anything.
function escapeIlikePattern(input: string): string {
  return input.replace(/[\\%_]/g, '\\$&');
}

// Optional fields: keep null/undefined as null; trim non-empty strings.
function trimOrNull(v: string | null | undefined): string | null {
  if (v == null) return null;
  const t = v.trim();
  return t === '' ? null : t;
}

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
    .order('delivery_date', { ascending: false });

  if (error) throw humanizeError(error);
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
      patient_name: delivery.patientName.trim(),
      patient_age: delivery.patientAge,
      patient_address: delivery.patientAddress.trim(),
      patient_taluka: trimOrNull(delivery.patientTaluka),
      patient_district: trimOrNull(delivery.patientDistrict),
      aadhaar_last4: trimOrNull(delivery.aadhaarLast4),
      delivery_date: delivery.deliveryDate.toISOString(),
      baby_sex: delivery.babySex,
      delivery_type: delivery.deliveryType,
      baby_weight_kg: delivery.babyWeightKg ?? null,
      created_by: userId,
      last_modified_by: userId,
    })
    .select('*, hospitals(name)')
    .single();

  if (error) throw humanizeError(error);
  return toDeliveryRecord(data);
}

export async function getDeliveryById(id: string): Promise<DeliveryRecord> {
  const { data, error } = await supabase
    .from('delivery_records')
    .select('*, hospitals(name)')
    .eq('id', id)
    .single();

  if (error) throw humanizeError(error);
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
      patient_name: updates.patientName.trim(),
      patient_age: updates.patientAge,
      patient_address: updates.patientAddress.trim(),
      patient_taluka: trimOrNull(updates.patientTaluka),
      patient_district: trimOrNull(updates.patientDistrict),
      aadhaar_last4: trimOrNull(updates.aadhaarLast4),
      delivery_date: updates.deliveryDate.toISOString(),
      baby_sex: updates.babySex,
      delivery_type: updates.deliveryType,
      baby_weight_kg: updates.babyWeightKg ?? null,
      last_modified_by: userId,
    })
    .eq('id', id)
    .select('*, hospitals(name)')
    .single();

  if (error) throw humanizeError(error);
  return toDeliveryRecord(data);
}

export async function deleteDelivery(id: string): Promise<void> {
  const { error } = await supabase
    .from('delivery_records')
    .delete()
    .eq('id', id);
  if (error) throw humanizeError(error);
}

export async function searchDeliveries(filters: SearchFilters): Promise<DeliveryRecord[]> {
  let query = supabase
    .from('delivery_records')
    .select('*, hospitals(name)')
    .order('delivery_date', { ascending: false });

  if (filters.patientName) {
    query = query.ilike('patient_name', `%${escapeIlikePattern(filters.patientName.trim())}%`);
  }
  if (filters.aadhaarLast4) {
    query = query.eq('aadhaar_last4', filters.aadhaarLast4);
  }
  if (filters.serialNumber) {
    query = query.eq('serial_number', filters.serialNumber.trim());
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
  if (error) throw humanizeError(error);
  return (data ?? []).map(toDeliveryRecord);
}
