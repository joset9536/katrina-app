-- Katrina Restobar — schema para un Supabase nuevo
-- Pegá este archivo completo en SQL Editor y ejecutalo una sola vez.

-- CHAT
CREATE TABLE IF NOT EXISTS public.chat (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id text NOT NULL,
  usuario text NOT NULL,
  mensaje text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('cliente','staff')),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.chat TO anon, authenticated;
GRANT ALL ON public.chat TO service_role;
ALTER TABLE public.chat ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "chat readable by all" ON public.chat;
DROP POLICY IF EXISTS "chat insert by all" ON public.chat;
CREATE POLICY "chat readable by all" ON public.chat FOR SELECT USING (true);
CREATE POLICY "chat insert by all" ON public.chat FOR INSERT WITH CHECK (true);
CREATE INDEX IF NOT EXISTS chat_mesa_created_idx ON public.chat (mesa_id, created_at);

-- MESAS
CREATE TABLE IF NOT EXISTS public.mesas (
  id text PRIMARY KEY,
  numero int UNIQUE NOT NULL,
  estado text NOT NULL DEFAULT 'libre' CHECK (estado IN ('libre','ocupada','vacia')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mesas TO anon, authenticated;
GRANT ALL ON public.mesas TO service_role;
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mesas read all" ON public.mesas;
DROP POLICY IF EXISTS "mesas insert all" ON public.mesas;
DROP POLICY IF EXISTS "mesas update all" ON public.mesas;
DROP POLICY IF EXISTS "mesas delete all" ON public.mesas;
CREATE POLICY "mesas read all" ON public.mesas FOR SELECT USING (true);
CREATE POLICY "mesas insert all" ON public.mesas FOR INSERT WITH CHECK (true);
CREATE POLICY "mesas update all" ON public.mesas FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "mesas delete all" ON public.mesas FOR DELETE USING (true);

INSERT INTO public.mesas (id, numero)
SELECT 'mesa-' || g, g FROM generate_series(1, 30) g
ON CONFLICT (id) DO NOTHING;

-- LLAMADOS
CREATE TABLE IF NOT EXISTS public.llamados (
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
DROP POLICY IF EXISTS "llamados read all" ON public.llamados;
DROP POLICY IF EXISTS "llamados insert all" ON public.llamados;
DROP POLICY IF EXISTS "llamados update all" ON public.llamados;
DROP POLICY IF EXISTS "llamados delete all" ON public.llamados;
CREATE POLICY "llamados read all" ON public.llamados FOR SELECT USING (true);
CREATE POLICY "llamados insert all" ON public.llamados FOR INSERT WITH CHECK (true);
CREATE POLICY "llamados update all" ON public.llamados FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "llamados delete all" ON public.llamados FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS llamados_status_idx ON public.llamados(status, prioridad DESC, timestamp ASC);
CREATE INDEX IF NOT EXISTS llamados_mesa_idx ON public.llamados(mesa_id);

-- STAFF TURNOS
CREATE TABLE IF NOT EXISTS public.staff_turnos (
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
DROP POLICY IF EXISTS "staff read all" ON public.staff_turnos;
DROP POLICY IF EXISTS "staff insert all" ON public.staff_turnos;
DROP POLICY IF EXISTS "staff update all" ON public.staff_turnos;
DROP POLICY IF EXISTS "staff delete all" ON public.staff_turnos;
CREATE POLICY "staff read all" ON public.staff_turnos FOR SELECT USING (true);
CREATE POLICY "staff insert all" ON public.staff_turnos FOR INSERT WITH CHECK (true);
CREATE POLICY "staff update all" ON public.staff_turnos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "staff delete all" ON public.staff_turnos FOR DELETE USING (true);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id text NOT NULL,
  photo_key text NOT NULL,
  name text NOT NULL,
  description text,
  price text,
  price_whole text,
  price_half text,
  sort_order int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "menu_items read all" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items insert all" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items update all" ON public.menu_items;
DROP POLICY IF EXISTS "menu_items delete all" ON public.menu_items;
CREATE POLICY "menu_items read all" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items insert all" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "menu_items update all" ON public.menu_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "menu_items delete all" ON public.menu_items FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS menu_items_category_idx ON public.menu_items(category_id, sort_order);

-- PEDIDOS
CREATE TABLE IF NOT EXISTS public.pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mesa_id text NOT NULL REFERENCES public.mesas(id) ON DELETE CASCADE,
  cliente_nombre text NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente','visto','entregado','cancelado')),
  llamado_id uuid REFERENCES public.llamados(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pedidos TO anon, authenticated;
GRANT ALL ON public.pedidos TO service_role;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pedidos read all" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos insert all" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos update all" ON public.pedidos;
DROP POLICY IF EXISTS "pedidos delete all" ON public.pedidos;
CREATE POLICY "pedidos read all" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "pedidos insert all" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "pedidos update all" ON public.pedidos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "pedidos delete all" ON public.pedidos FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS pedidos_mesa_idx ON public.pedidos(mesa_id, created_at DESC);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mesas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.llamados;
ALTER PUBLICATION supabase_realtime ADD TABLE public.staff_turnos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;

CREATE OR REPLACE FUNCTION public.tick_updated_at()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS mesas_updated ON public.mesas;
CREATE TRIGGER mesas_updated BEFORE UPDATE ON public.mesas
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
DROP TRIGGER IF EXISTS staff_updated ON public.staff_turnos;
CREATE TRIGGER staff_updated BEFORE UPDATE ON public.staff_turnos
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
DROP TRIGGER IF EXISTS menu_items_updated ON public.menu_items;
CREATE TRIGGER menu_items_updated BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
