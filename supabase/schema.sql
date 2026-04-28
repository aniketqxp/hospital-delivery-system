-- ============================================================
-- Hospital Delivery System — Supabase Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================


-- ── Tables ───────────────────────────────────────────────────

CREATE TABLE hospitals (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  license_tier  TEXT        NOT NULL DEFAULT 'free'
                            CHECK (license_tier IN ('free', 'basic', 'premium')),
  feature_flags JSONB       NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Links a Supabase auth user to a hospital
CREATE TABLE user_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hospital_id  UUID NOT NULL REFERENCES hospitals(id),
  display_name TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Atomic daily counter per hospital (drives serial numbers)
CREATE TABLE serial_counters (
  hospital_id   UUID NOT NULL REFERENCES hospitals(id),
  delivery_date DATE NOT NULL,
  counter       INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (hospital_id, delivery_date)
);

CREATE TABLE delivery_records (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hospital_id       UUID        NOT NULL REFERENCES hospitals(id),
  serial_number     TEXT        NOT NULL,
  patient_name      TEXT        NOT NULL,
  patient_name_lower TEXT       NOT NULL,
  patient_age       INTEGER     NOT NULL CHECK (patient_age > 0),
  patient_address   TEXT        NOT NULL,
  aadhaar_last4     CHAR(4)     CHECK (aadhaar_last4 ~ '^[0-9]{4}$'),
  delivery_date     TIMESTAMPTZ NOT NULL,
  baby_sex          TEXT        NOT NULL
                                CHECK (baby_sex IN (
                                  'Male', 'Female',
                                  'Twins (1 Male, 1 Female)',
                                  'Twins (Both Male)',
                                  'Twins (Both Female)'
                                )),
  delivery_type     TEXT        NOT NULL
                                CHECK (delivery_type IN (
                                  'Full Term Normal Delivery',
                                  'Vacuum Delivery',
                                  'Cesarean Section'
                                )),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW(),
  created_by        UUID        REFERENCES auth.users(id),
  last_modified_by  UUID        REFERENCES auth.users(id)
);


-- ── Functions & Triggers ─────────────────────────────────────

-- Atomically increments the daily counter and returns YYYY-MM-DD-XXX
CREATE OR REPLACE FUNCTION generate_serial_number(p_hospital_id UUID, p_delivery_date DATE)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_counter INTEGER;
BEGIN
  INSERT INTO serial_counters (hospital_id, delivery_date, counter)
  VALUES (p_hospital_id, p_delivery_date, 1)
  ON CONFLICT (hospital_id, delivery_date)
  DO UPDATE SET counter = serial_counters.counter + 1
  RETURNING counter INTO v_counter;

  RETURN to_char(p_delivery_date, 'YYYY-MM-DD') || '-' || lpad(v_counter::text, 3, '0');
END;
$$;

-- Fires BEFORE INSERT: sets serial_number and patient_name_lower
CREATE OR REPLACE FUNCTION before_insert_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.serial_number     := generate_serial_number(NEW.hospital_id, NEW.delivery_date::DATE);
  NEW.patient_name_lower := lower(NEW.patient_name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER delivery_before_insert
BEFORE INSERT ON delivery_records
FOR EACH ROW EXECUTE FUNCTION before_insert_delivery();

-- Fires BEFORE UPDATE: refreshes updated_at and patient_name_lower
CREATE OR REPLACE FUNCTION before_update_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at         := NOW();
  NEW.patient_name_lower := lower(NEW.patient_name);
  RETURN NEW;
END;
$$;

CREATE TRIGGER delivery_before_update
BEFORE UPDATE ON delivery_records
FOR EACH ROW EXECUTE FUNCTION before_update_delivery();


-- ── Row Level Security ────────────────────────────────────────

ALTER TABLE hospitals        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE serial_counters  ENABLE ROW LEVEL SECURITY;

-- Hospitals: read own hospital only
CREATE POLICY "read own hospital" ON hospitals
  FOR SELECT USING (
    id = (SELECT hospital_id FROM user_profiles WHERE id = auth.uid())
  );

-- User profiles: read own profile only
CREATE POLICY "read own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Delivery records: full CRUD restricted to own hospital
CREATE POLICY "hospital select" ON delivery_records
  FOR SELECT USING (
    hospital_id = (SELECT hospital_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "hospital insert" ON delivery_records
  FOR INSERT WITH CHECK (
    hospital_id = (SELECT hospital_id FROM user_profiles WHERE id = auth.uid())
  );

CREATE POLICY "hospital update" ON delivery_records
  FOR UPDATE USING (
    hospital_id = (SELECT hospital_id FROM user_profiles WHERE id = auth.uid())
  );

-- Serial counters: no direct client access (only via SECURITY DEFINER trigger)
CREATE POLICY "no direct access" ON serial_counters
  USING (false);


-- ── Initial Setup ─────────────────────────────────────────────
-- After running this schema, do the following in the Supabase dashboard:
--
-- 1. Authentication > Users > Add user (email + password for each staff member)
--
-- 2. Run this to create the hospital and link the user:
--
--   INSERT INTO hospitals (name) VALUES ('Your Hospital Name Here')
--   RETURNING id;
--
--   -- Use the returned id in the next statement:
--   INSERT INTO user_profiles (id, hospital_id, display_name)
--   VALUES ('<user-uuid-from-auth>', '<hospital-id-from-above>', 'Staff Name');
