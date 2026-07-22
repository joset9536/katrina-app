import { supabase } from "@/integrations/supabase/client";

export type MenuItem = {
  name: string;
  description?: string;
  price?: string;
  priceWhole?: string;
  priceHalf?: string;
  photoKey?: string;
};

export type MenuCategory = {
  id: string;
  label: string;
  subtitle?: string;
  priceMode?: "single" | "pizza";
  kind?: "cocina" | "barra";
  items: MenuItem[];
};

// Fuente de verdad del texto de la carta (sin fotos — esto lo usa tanto
// MenuGrid.tsx como el asistente de IA server-side, para que nunca queden
// desincronizados ni el server tenga que cargar imagenes).
export const MENU_CATEGORIES: MenuCategory[] = [
  {
    id: "hamburguesas",
    label: "Hamburguesas",
    subtitle: "Todas incluyen papas",
    items: [
      { name: "Classic Burger", price: "$9.000", description: "Lechuga, tomate, huevo, jamón, queso y papas." },
      { name: "Doble Burger", price: "$13.000", description: "Doble carne, lechuga, tomate, huevo y papas." },
      { name: "Katrina Burger", price: "$16.000", description: "Doble carne 150gr, bacon, cheddar, salsa americana, huevo y papas." },
      { name: "Baño de Cheddar", price: "$3.000", description: "Adicional para cualquier hamburguesa." },
      { name: "Bandeja de Hamburguesas", price: "Consultar", description: "Para compartir: varias hamburguesas con papas al centro." },
      { name: "Hamburguesas con Panes de Colores", price: "Consultar", description: "Panes artesanales de colores realizados por Carmelo." },
    ],
  },
  {
    id: "pizzas",
    label: "Pizzas",
    subtitle: "Precios entera / media",
    priceMode: "pizza",
    items: [
      { name: "Pizza Común", priceWhole: "$9.000", priceHalf: "$5.000" },
      { name: "Pizza Especial", priceWhole: "$11.000", priceHalf: "$6.000" },
      { name: "Pizza Doble Queso", priceWhole: "$11.000", priceHalf: "$6.000" },
      { name: "Pizza de Pollo", priceWhole: "$15.000", priceHalf: "$8.000" },
      { name: "Pizza Napolitana", priceWhole: "$11.000", priceHalf: "$6.000" },
      { name: "Pizza de Ternera", priceWhole: "$18.000", priceHalf: "$10.000" },
      { name: "Pizza Mexicana", priceWhole: "$18.000", priceHalf: "$10.000", description: "Picante suave." },
    ],
  },
  {
    id: "sandwiches",
    label: "Sándwiches",
    subtitle: "Todos incluyen papas",
    items: [
      { name: "Lomito Clásico", price: "$10.000", description: "Lechuga, tomate, huevo, jamón, queso y papas." },
      { name: "Lomito Katrina", price: "$15.000", description: "Bacon, cheddar, salsa americana, huevo y papas." },
      { name: "Sándwich de Milanesa", price: "$10.000", description: "Lechuga, tomate, huevo, jamón, queso y papas." },
      { name: "Milanesa Katrina", price: "$15.000", description: "Bacon, cheddar, salsa americana, huevo y papas." },
      { name: "Especial Katrina", price: "$18.000", description: "Bife de chorizo, cebolla caramelizada, muzarella, morrón asado, mayonesa de ajo y papas." },
      { name: "Lomo Katrina", price: "Consultar", description: "Nuestro lomo con la impronta Katrina." },
      { name: "Lomo al Champiñón", price: "Consultar", description: "Con papas españolas y salsa de champiñones." },
      { name: "Milanesa Napolitana para 2 personas", price: "Consultar", description: "Milanesa napolitana para compartir entre dos." },
    ],
  },
  {
    id: "compartir",
    label: "Para Compartir",
    subtitle: "Noche mexicana y tablas",
    items: [
      { name: "Tacos del Norte", price: "$12.000 / $20.000", description: "Carne, pollo o mixtos. 3 tortillas (1p) · 6 tortillas (2p)." },
      { name: "Charly Gratinado", price: "$18.000 / $30.000", description: "Pan de miga, ternera, verdura, queso y papas. Chico / Grande." },
      { name: "Nachos del Desierto", price: "Consultar", description: "Con dip de guacamole y cheddar." },
      { name: "Picada Fría", price: "$20.000", description: "Salame, jamón, muzarella, cheddar, aceitunas, papas Lays y maní. 2p." },
      { name: "Picada Caliente", price: "$25.000 / $35.000", description: "Milanesa, aros de cebolla, papas, bastones de muzarella, crock, salchicha envuelta + 3 dips. 2p / 4p." },
    ],
  },
  {
    id: "bajon",
    label: "El Bajón",
    subtitle: "Fritos & Hot Dogs",
    items: [
      { name: "Hot Dog Callejero", price: "$5.000", description: "Simple, como en la calle." },
      { name: "Hot Dog Frontera", price: "$6.000", description: "Especial de la casa." },
      { name: "Hot Dog Encamisado", price: "$8.000", description: "Envuelto en huevo con queso gratinado." },
      { name: "Papas con Cheddar & Bacon", price: "$9.000" },
      { name: "Papas Clásicas", price: "$7.000" },
      { name: "Salchipapas", price: "$7.000" },
      { name: "Pollo Frito con Papas", price: "$10.000" },
    ],
  },
  {
    id: "postres",
    label: "Dulce Final",
    subtitle: "Postres",
    items: [
      { name: "Mini Cheesecake de Frutos Rojos", price: "Consultar en mesa" },
      { name: "Mini Cheesecake de Maracuyá", price: "Consultar en mesa" },
      { name: "Postre Oreo", price: "Consultar en mesa" },
      { name: "Tiramisú", price: "Consultar en mesa" },
    ],
  },
  {
    id: "barra",
    label: "Barra",
    subtitle: "Tragos y cervezas — precios a consultar",
    kind: "barra",
    items: [
      { name: "Daiquiri de Frutilla", price: "Consultar", description: "O combinado con durazno. Sin alcohol." },
      { name: "Daiquiri en Rocas", price: "Consultar" },
      { name: "Frozen / Daiquiri", price: "Consultar" },
      { name: "Sex on the Beach", price: "Consultar" },
      { name: "Jarra de Gancia", price: "Consultar" },
      { name: "Trago con Menta", price: "Consultar" },
      { name: "Trago de Naranja", price: "Consultar" },
      { name: "Trago Doble Colado", price: "Consultar" },
      { name: "Licor de Pepino", price: "Consultar" },
      { name: "Limonada de Frutos Rojos", price: "Consultar" },
    ],
  },
];

export const KATRINA_INFO = {
  nombre: "Katrina",
  direccion: "Egüés 517, Orán, Salta",
  horario: "Todos los días de 19:00 a 02:00 hs",
  whatsapp: "5493878631310",
  instagram: "https://instagram.com/katrina.restobar",
};

export type MenuItemRow = {
  id: string;
  category_id: string;
  photo_key: string;
  name: string;
  description: string | null;
  price: string | null;
  price_whole: string | null;
  price_half: string | null;
  sort_order: number;
};

/**
 * Trae los items editables desde Supabase (tabla `menu_items`, la edita la
 * dueña desde /owner). Si la tabla todavia no existe o esta vacia, devuelve
 * null y el que llama tiene que usar MENU_CATEGORIES (texto fijo) como
 * respaldo — asi el sitio nunca se rompe por esto.
 */
export async function fetchLiveMenuByCategory(): Promise<Record<string, MenuItem[]> | null> {
  try {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error || !data || data.length === 0) return null;

    const byCategory: Record<string, MenuItem[]> = {};
    for (const row of data as MenuItemRow[]) {
      const item: MenuItem = {
        name: row.name,
        description: row.description ?? undefined,
        price: row.price ?? undefined,
        priceWhole: row.price_whole ?? undefined,
        priceHalf: row.price_half ?? undefined,
        photoKey: row.photo_key,
      };
      (byCategory[row.category_id] ??= []).push(item);
    }
    return byCategory;
  } catch {
    return null;
  }
}

/** Mezcla los items en vivo (si hay) sobre las categorias fijas (label/subtitle/kind). */
export function mergeLiveMenu(
  liveByCategory: Record<string, MenuItem[]> | null,
): MenuCategory[] {
  if (!liveByCategory) return MENU_CATEGORIES;
  return MENU_CATEGORIES.map((cat) => ({
    ...cat,
    items: liveByCategory[cat.id]?.length ? liveByCategory[cat.id] : cat.items,
  }));
}

/** Semilla inicial: vuelca MENU_CATEGORIES a filas de menu_items (una sola vez). */
export function buildSeedRows() {
  return MENU_CATEGORIES.flatMap((cat) =>
    cat.items.map((item, i) => ({
      category_id: cat.id,
      photo_key: item.name,
      name: item.name,
      description: item.description ?? null,
      price: item.price ?? null,
      price_whole: item.priceWhole ?? null,
      price_half: item.priceHalf ?? null,
      sort_order: i,
    })),
  );
}
