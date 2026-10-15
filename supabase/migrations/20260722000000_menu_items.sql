-- MENU ITEMS (editable por la dueña desde /owner, sin tocar código)
CREATE TABLE public.menu_items (
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
CREATE POLICY "menu_items read all" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "menu_items insert all" ON public.menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "menu_items update all" ON public.menu_items FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "menu_items delete all" ON public.menu_items FOR DELETE USING (true);

CREATE INDEX menu_items_category_idx ON public.menu_items(category_id, sort_order);

ALTER PUBLICATION supabase_realtime ADD TABLE public.menu_items;

CREATE TRIGGER menu_items_updated BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.tick_updated_at();
