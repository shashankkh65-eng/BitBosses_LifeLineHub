-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('donor', 'organisation', 'savior');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users see own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Organisation profiles
CREATE TABLE public.organisation_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  contact_email text NOT NULL,
  phone text,
  location text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organisation_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone authenticated can view orgs" ON public.organisation_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "org owner can insert self" ON public.organisation_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "org owner can update self" ON public.organisation_profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Savior profiles
CREATE TABLE public.savior_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text NOT NULL,
  location text NOT NULL,
  vehicle text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.savior_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone authenticated can view saviors" ON public.savior_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "savior owner can insert self" ON public.savior_profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "savior owner can update self" ON public.savior_profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- Requests
CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL CHECK (category IN ('food','money','healthcare','clothing','other')),
  description text,
  quantity text,
  location text NOT NULL,
  urgency text NOT NULL DEFAULT 'medium' CHECK (urgency IN ('low','medium','high')),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','accepted','assigned','completed')),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  accepted_by uuid REFERENCES auth.users(id),
  assigned_to uuid REFERENCES auth.users(id),
  donor_note text,
  proof text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone authenticated can view requests" ON public.requests FOR SELECT TO authenticated USING (true);

CREATE POLICY "orgs create own requests" ON public.requests FOR INSERT TO authenticated
WITH CHECK (created_by = auth.uid() AND public.has_role(auth.uid(), 'organisation'));

-- Update policy: any authenticated user can attempt update; trigger validates allowed transitions
CREATE POLICY "role-based update" ON public.requests FOR UPDATE TO authenticated
USING (
  (public.has_role(auth.uid(), 'donor') AND status = 'open')
  OR (public.has_role(auth.uid(), 'savior') AND status IN ('accepted','assigned') AND (assigned_to IS NULL OR assigned_to = auth.uid()))
  OR (created_by = auth.uid())
);

-- Trigger: enforce transition rules and stamp updated_at
CREATE OR REPLACE FUNCTION public.requests_validate_update()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  -- creator/title/category cannot change
  IF NEW.created_by <> OLD.created_by THEN RAISE EXCEPTION 'created_by immutable'; END IF;

  -- Transitions
  IF OLD.status = 'open' AND NEW.status = 'accepted' THEN
    IF NEW.accepted_by IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'donor must accept as themselves'; END IF;
    IF NOT public.has_role(auth.uid(), 'donor') THEN RAISE EXCEPTION 'only donors can accept'; END IF;
  ELSIF OLD.status = 'accepted' AND NEW.status = 'assigned' THEN
    IF NEW.assigned_to IS DISTINCT FROM auth.uid() THEN RAISE EXCEPTION 'savior must assign as themselves'; END IF;
    IF NOT public.has_role(auth.uid(), 'savior') THEN RAISE EXCEPTION 'only saviors can assign'; END IF;
  ELSIF OLD.status = 'assigned' AND NEW.status = 'completed' THEN
    IF NEW.assigned_to <> auth.uid() THEN RAISE EXCEPTION 'only the assigned savior can complete'; END IF;
  ELSIF NEW.status = OLD.status THEN
    -- allow non-status field tweaks by creator only
    IF auth.uid() <> OLD.created_by THEN RAISE EXCEPTION 'only creator can edit details'; END IF;
  ELSE
    RAISE EXCEPTION 'invalid status transition: % -> %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END $$;

CREATE TRIGGER trg_requests_validate_update BEFORE UPDATE ON public.requests
FOR EACH ROW EXECUTE FUNCTION public.requests_validate_update();

-- Auto-create role + profile on signup based on user_metadata.role
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_role text := COALESCE(NEW.raw_user_meta_data->>'role', 'donor');
BEGIN
  -- Insert role
  IF v_role IN ('donor','organisation','savior') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, v_role::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  IF v_role = 'organisation' THEN
    INSERT INTO public.organisation_profiles (id, name, contact_email, phone, location, description)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', 'Organisation'),
      COALESCE(NEW.raw_user_meta_data->>'contact_email', NEW.email),
      NEW.raw_user_meta_data->>'phone',
      COALESCE(NEW.raw_user_meta_data->>'location', ''),
      NEW.raw_user_meta_data->>'description'
    )
    ON CONFLICT DO NOTHING;
  ELSIF v_role = 'savior' THEN
    INSERT INTO public.savior_profiles (id, full_name, phone, location, vehicle)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Savior'),
      COALESCE(NEW.raw_user_meta_data->>'phone', ''),
      COALESCE(NEW.raw_user_meta_data->>'location', ''),
      NEW.raw_user_meta_data->>'vehicle'
    )
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created_role
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();
