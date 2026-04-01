export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "password123"
};

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: string;
  image: string;
  additionalImages?: string[];
  isBestSeller: boolean;
  stock: number;
  deliveryTime: string;
}

export const CATEGORIES = [
  { name: "Ramos de rosas", slug: "ramos-de-rosas" },
  { name: "Flores mixtas", slug: "flores-mixtas" },
  { name: "Desayunos sorpresa", slug: "desayunos-sorpresa" },
  { name: "Regalos con vino", slug: "regalos-con-vino" },
  { name: "Cumpleaños", slug: "cumpleanos" },
  { name: "Amor y aniversario", slug: "amor-y-aniversario" },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Ramo de Rosas Rojas Premium",
    description: "Elegante ramo de 24 rosas rojas frescas de exportación, envueltas en papel decorativo y lazo de seda. Ideal para expresar amor profundo.",
    category: "Ramos de rosas",
    price: "$45.00",
    image: "https://images.unsplash.com/photo-1591512401823-74ac5003c4cf?auto=format&fit=crop&q=80&w=800",
    additionalImages: ["https://images.unsplash.com/photo-1591512401823-74ac5003c4cf?auto=format&fit=crop&q=80&w=800"],
    isBestSeller: true,
    stock: 15,
    deliveryTime: "2-3 horas"
  },
  {
    id: "2",
    name: "Arreglo Primaveral Mixto",
    description: "Combinación vibrante de lirios, margaritas y claveles en tonos pasteles. Una explosión de frescura para cualquier ocasión.",
    category: "Flores mixtas",
    price: "$38.00",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0fab?auto=format&fit=crop&q=80&w=800",
    additionalImages: ["https://images.unsplash.com/photo-1563241527-3004b7be0fab?auto=format&fit=crop&q=80&w=800"],
    isBestSeller: true,
    stock: 12,
    deliveryTime: "2-4 horas"
  },
  {
    id: "3",
    name: "Cesta Sorpresa Gourmet",
    description: "Completo desayuno que incluye café premium, croissants recién horneados, ensalada de frutas frescas, jugo de naranja y un mini bouquet decorativo.",
    category: "Desayunos sorpresa",
    price: "$55.00",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800",
    additionalImages: ["https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=800"],
    isBestSeller: true,
    stock: 8,
    deliveryTime: "En la mañana (6am - 10am)"
  },
  {
    id: "4",
    name: "Caja de Rosas Bouquet Royal",
    description: "Caja de lujo con 12 rosas seleccionadas y follaje decorativo. Un regalo sofisticado y duradero.",
    category: "Amor y aniversario",
    price: "$32.00",
    image: "https://images.unsplash.com/photo-1558301211-0d8c8ddee6ec?auto=format&fit=crop&q=80&w=800",
    isBestSeller: false,
    stock: 20,
    deliveryTime: "2-3 horas"
  },
  {
    id: "5",
    name: "Vino & Flores Selection",
    description: "Caja de regalo que incluye una botella de vino tinto Cabernet Sauvignon y un pequeño arreglo de flores complementario.",
    category: "Regalos con vino",
    price: "$65.00",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800",
    isBestSeller: false,
    stock: 5,
    deliveryTime: "3-5 horas"
  },
  {
    id: "6",
    name: "Bouquet Cumpleaños Alegre",
    description: "Arreglo colorido con globos metalizados y flores mixtas. La mejor forma de desear un feliz día.",
    category: "Cumpleaños",
    price: "$40.00",
    image: "https://images.unsplash.com/photo-1530103578275-21127a723e40?auto=format&fit=crop&q=80&w=800",
    isBestSeller: false,
    stock: 10,
    deliveryTime: "2-4 horas"
  }
];


export const SALES_DATA = [
  { month: "Ene", sales: 8500 },
  { month: "Feb", sales: 15200 },
  { month: "Mar", sales: 9800 },
  { month: "Abr", sales: 11100 },
  { month: "May", sales: 18900 },
  { month: "Jun", sales: 10500 },
];
