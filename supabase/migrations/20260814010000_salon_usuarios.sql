CREATE TABLE IF NOT EXISTS public.salon_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  clave_hash text,
  rol text NOT NULL DEFAULT 'mozo' CHECK (rol IN ('gerente','mozo')),
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS salon_usuarios_nombre_idx ON public.salon_usuarios (lower(nombre));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.salon_usuarios TO anon, authenticated;
GRANT ALL ON public.salon_usuarios TO service_role;
ALTER TABLE public.salon_usuarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "salon_usuarios read all" ON public.salon_usuarios;
DROP POLICY IF EXISTS "salon_usuarios insert all" ON public.salon_usuarios;
DROP POLICY IF EXISTS "salon_usuarios update all" ON public.salon_usuarios;
DROP POLICY IF EXISTS "salon_usuarios delete all" ON public.salon_usuarios;
CREATE POLICY "salon_usuarios read all" ON public.salon_usuarios FOR SELECT USING (true);
CREATE POLICY "salon_usuarios insert all" ON public.salon_usuarios FOR INSERT WITH CHECK (true);
CREATE POLICY "salon_usuarios update all" ON public.salon_usuarios FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "salon_usuarios delete all" ON public.salon_usuarios FOR DELETE USING (true);
