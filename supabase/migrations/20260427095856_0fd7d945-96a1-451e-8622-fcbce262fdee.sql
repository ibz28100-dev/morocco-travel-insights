
-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Transporters
CREATE TABLE public.transporters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.transporters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read transporters" ON public.transporters FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert transporters" ON public.transporters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update transporters" ON public.transporters FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete transporters" ON public.transporters FOR DELETE TO authenticated USING (true);
CREATE TRIGGER transporters_updated BEFORE UPDATE ON public.transporters
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Destinations
CREATE TABLE public.destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read destinations" ON public.destinations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert destinations" ON public.destinations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update destinations" ON public.destinations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete destinations" ON public.destinations FOR DELETE TO authenticated USING (true);

-- Trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transporter_id UUID REFERENCES public.transporters(id) ON DELETE SET NULL,
  departure_city TEXT NOT NULL,
  destination_city TEXT NOT NULL,
  date DATE NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read trips" ON public.trips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert trips" ON public.trips FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update trips" ON public.trips FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete trips" ON public.trips FOR DELETE TO authenticated USING (true);
CREATE TRIGGER trips_updated BEFORE UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE INDEX trips_date_idx ON public.trips(date);
CREATE INDEX trips_transporter_idx ON public.trips(transporter_id);

-- Reservations
CREATE TABLE public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  number_of_passengers INTEGER NOT NULL DEFAULT 1 CHECK (number_of_passengers > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auth read reservations" ON public.reservations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Auth insert reservations" ON public.reservations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Auth update reservations" ON public.reservations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Auth delete reservations" ON public.reservations FOR DELETE TO authenticated USING (true);
CREATE INDEX reservations_trip_idx ON public.reservations(trip_id);
