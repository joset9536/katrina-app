
-- MESAS
CREATE TABLE public.mesas (
  id text PRIMARY KEY,
  numero int UNIQUE NOT NULL,
  estado text NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre','ocupada','vacia')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mesas TO anon, authenticated;
GRANT ALL ON public.mesas TO service_role;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mesas read all" ON public.mesas FOR SELECT USING (true);
CREATE POLICY "mesas insert all" ON public.mesas FOR INSERT WITH CHECK (true);
CREATE POLICY "mesas update all" ON public.mesas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "mesas delete all" ON public.mesas FOR DELETE USING (true);

INSERT INTO public.mesas (id, numero)
SELECT 'mesa-' || g, g FROM generate_series(1, 30) g;

-- LLAMADOS
CREATE TABLE public.llamados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id text NOT NULL REFERENCES public.mesas(id) ON DELETE CASCADE,
  cliente_nombre text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  prioridad int NOT NULL DEFAULT 0,
  staff_asignado text,
  respondido_at timestamptz,
  status text NOT NULL DEFAULT 'en_espera' CHECK (status IN ('en_espera','atendido','resuelto','abandonado'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.llamados TO anon, authenticated;
GRANT ALL ON public.llamados TO service_role;
ALTER TABLE public.llamados ENABLE ROW LEVEL SECURITY;
CREATE POLICY "llamados read all" ON public.llamados FOR SELECT USING (true);
CREATE POLICY "llamados insert all" ON public.llamados FOR INSERT WITH CHECK (true);
CREATE POLICY "llamados update all" ON public.llamados FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "llamados delete all" ON public.llamados FOR DELETE USING (true);

CREATE INDEX llamados_status_idx ON public.llamados(status, prioridad DESC, timestamp ASC);
CREATE INDEX llamados_mesa_idx ON public.llamados(mesa_id);

-- STAFF TURNOS
CREATE TABLE public.staff_turnos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_nombre text NOT NULL,
  mesas_asignadas int[] NOT NULL DEFAULT ARRAY[]::int[],
  estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo','descanso','offline')),
  llamados_pendientes int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.staff_turnos TO anon, authenticated;
GRANT ALL ON public.staff_turnos TO service_role;
ALTER TABLE public.staff_turnos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "staff read all" ON public.staff_turnos FOR SELECT USING (true);
CREATE POLICY "staff insert all" ON public.staff_turnos FOR INSERT WITH CHECK (true);
CREATE POLICY "staff update all" ON public.staff_turnos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "staff delete all" ON public.staff_turnos FOR DELETE USING (true);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.mesas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.llamados;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_turnos;

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.tick_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER mesas_updated BEFORE UPDATE ON public.mesas
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
CREATE TRIGGER staff_updated BEFORE UPDATE ON public.staff_turnos
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
