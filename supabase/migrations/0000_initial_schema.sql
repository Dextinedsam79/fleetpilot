-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum for User Roles
CREATE TYPE user_role AS ENUM ('CUSTOMER', 'STAFF', 'MANAGER', 'ADMIN');

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'CUSTOMER',
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicles Table
CREATE TYPE vehicle_status AS ENUM ('AVAILABLE', 'RESERVED', 'RENTED', 'MAINTENANCE', 'OUT_OF_SERVICE', 'ARCHIVED');

CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INT NOT NULL,
    license_plate TEXT UNIQUE NOT NULL,
    vin TEXT UNIQUE NOT NULL,
    status vehicle_status NOT NULL DEFAULT 'AVAILABLE',
    mileage INT NOT NULL DEFAULT 0,
    fuel_level NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    daily_rate NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Vehicle Images
CREATE TABLE vehicle_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bookings Table
CREATE TYPE booking_status AS ENUM ('PENDING_APPROVAL', 'APPROVED', 'ACTIVE', 'COMPLETED', 'CANCELLED');

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES profiles(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status booking_status NOT NULL DEFAULT 'PENDING_APPROVAL',
    total_price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT valid_dates CHECK (end_time > start_time)
);

-- Inspections Table
CREATE TABLE inspections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES profiles(id),
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('PICKUP', 'RETURN')),
    mileage INT NOT NULL,
    fuel_level NUMERIC(5, 2) NOT NULL,
    damage_report TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Maintenance Records
CREATE TYPE maintenance_status AS ENUM ('DUE', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED');

CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT,
    status maintenance_status NOT NULL DEFAULT 'DUE',
    scheduled_date DATE,
    cost NUMERIC(10, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit Logs Table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RPC for Safe Booking (Prevents Double Booking)
CREATE OR REPLACE FUNCTION create_booking(
    p_customer_id UUID,
    p_vehicle_id UUID,
    p_start_time TIMESTAMPTZ,
    p_end_time TIMESTAMPTZ,
    p_total_price NUMERIC
) RETURNS UUID AS $$
DECLARE
    v_booking_id UUID;
    v_conflict BOOLEAN;
BEGIN
    -- Lock the vehicle row so no other transaction can book it concurrently
    PERFORM id FROM vehicles WHERE id = p_vehicle_id FOR UPDATE;

    -- Check for overlapping bookings that are not cancelled
    SELECT EXISTS (
        SELECT 1 FROM bookings
        WHERE vehicle_id = p_vehicle_id
        AND status IN ('PENDING_APPROVAL', 'APPROVED', 'ACTIVE')
        AND (p_start_time < end_time AND p_end_time > start_time)
    ) INTO v_conflict;

    IF v_conflict THEN
        RAISE EXCEPTION 'Vehicle is already booked for the selected dates.';
    END IF;

    -- Insert new booking
    INSERT INTO bookings (customer_id, vehicle_id, start_time, end_time, total_price, status)
    VALUES (p_customer_id, p_vehicle_id, p_start_time, p_end_time, p_total_price, 'PENDING_APPROVAL')
    RETURNING id INTO v_booking_id;

    RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit Trigger Function
CREATE OR REPLACE FUNCTION log_audit_event() RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (action, table_name, record_id, old_data, new_data)
    VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        row_to_json(OLD)::JSONB,
        row_to_json(NEW)::JSONB
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply Triggers
CREATE TRIGGER vehicles_audit
AFTER INSERT OR UPDATE OR DELETE ON vehicles
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

CREATE TRIGGER bookings_audit
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Customers can view their own profile
CREATE POLICY "View own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Customers can update their own profile
CREATE POLICY "Update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Staff can view all profiles
CREATE POLICY "Staff view all profiles" ON profiles FOR SELECT USING (auth_user_role() IN ('STAFF', 'MANAGER', 'ADMIN'));

-- Public can view available vehicles
CREATE POLICY "Public view vehicles" ON vehicles FOR SELECT USING (true);

-- Staff/Manager/Admin can do anything to vehicles (Simplified logic via role check function)
CREATE OR REPLACE FUNCTION auth_user_role() RETURNS TEXT AS $$
  SELECT role::TEXT FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Staff all vehicles" ON vehicles FOR ALL USING (auth_user_role() IN ('STAFF', 'MANAGER', 'ADMIN'));

-- Customers can view their own bookings
CREATE POLICY "View own bookings" ON bookings FOR SELECT USING (customer_id = auth.uid());

-- Staff can view all bookings
CREATE POLICY "Staff view bookings" ON bookings FOR SELECT USING (auth_user_role() IN ('STAFF', 'MANAGER', 'ADMIN'));

-- Staff can update bookings
CREATE POLICY "Staff update bookings" ON bookings FOR UPDATE USING (auth_user_role() IN ('STAFF', 'MANAGER', 'ADMIN'));

ALTER TABLE maintenance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff all maintenance" ON maintenance_records FOR ALL USING (auth_user_role() IN ('STAFF', 'MANAGER', 'ADMIN'));

-- Trigger to sync auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'CUSTOMER'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
