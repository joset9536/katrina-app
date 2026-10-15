CREATE TABLE public.chat (
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
CREATE POLICY "chat readable by all" ON public.chat FOR SELECT USING (true);
CREATE POLICY "chat insert by all" ON public.chat FOR INSERT WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat;
CREATE INDEX chat_mesa_created_idx ON public.chat (mesa_id, created_at);