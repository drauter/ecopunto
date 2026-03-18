-- Tablas principales para EcoPunto

-- 1. Perfiles de Estudiantes
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique,
  full_name text,
  course text,
  avatar_url text,
  points integer default 0,
  level integer default 1,
  avatar_state text default 'Semilla',
  is_admin boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);


-- 2. Registro de Acciones Ecológicas
create table activities (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  image_url text not null,
  status text default 'pending', -- pending, approved, rejected
  ai_score float,
  ai_metadata jsonb, -- Resultado detallado de Gemini
  location_lat float,
  location_lng float,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Historial de Puntos
create table points_history (
  id uuid default gen_random_uuid() primary key,
  student_id uuid references profiles(id) on delete cascade,
  activity_id uuid references activities(id),
  points_earned integer not null,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Politicas de Seguridad (RLS)
alter table profiles enable row level security;
alter table activities enable row level security;
alter table points_history enable row level security;

-- Los estudiantes pueden ver su propio perfil
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

-- Los estudiantes pueden actualizar su propio perfil
create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

-- Los estudiantes pueden ver sus propias actividades
create policy "Users can view own activities" on activities
  for select using (auth.uid() = student_id);

-- Los estudiantes pueden insertar actividades
create policy "Users can insert activities" on activities
  for insert with check (auth.uid() = student_id);

-- 4. Configuración Global (Logo, etc)
create table settings (
  id integer primary key default 1 check (id = 1), -- Solo una fila
  logo_url text,
  app_name text default 'EcoPunto',
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Politicas para settings
alter table settings enable row level security;
create policy "Settings visible for all" on settings for select using (true);
create policy "Only admins can update settings" on settings for update 
  using (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));
create policy "Only admins can insert settings" on settings for insert 
  with check (exists (select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true));

-- Insertar configuración inicial
insert into settings (id, app_name) values (1, 'EcoPunto') on conflict do nothing;

-- 5. Storage policies para settings bucket
-- El bucket 'settings' debe ser creado en el Dashboard de Supabase
create policy "Settings bucket visible for all" on storage.objects for select
  using (bucket_id = 'settings');
create policy "Admins can upload to settings" on storage.objects for insert
  with check (bucket_id = 'settings' and exists (
    select 1 from profiles where profiles.id = auth.uid() and profiles.is_admin = true
  ));
