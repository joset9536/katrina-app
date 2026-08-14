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
CREATE POLICY "pedidos read all" ON public.pedidos FOR SELECT USING (true);
CREATE POLICY "pedidos insert all" ON public.pedidos FOR INSERT WITH CHECK (true);
CREATE POLICY "pedidos update all" ON public.pedidos FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "pedidos delete all" ON public.pedidos FOR DELETE USING (true);
CREATE INDEX IF NOT EXISTS pedidos_mesa_idx ON public.pedidos(mesa_id, created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
