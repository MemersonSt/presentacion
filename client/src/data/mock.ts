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
  { 
    name: "Ramos de rosas", 
    slug: "ramos-de-rosas", 
    image: "/assets/product1.png" 
  },
  { 
    name: "Flores mixtas", 
    slug: "flores-mixtas", 
    image: "/assets/product2.png" 
  },
  { 
    name: "Desayunos sorpresa", 
    slug: "desayunos-sorpresa", 
    image: "/assets/product3.png" 
  },
  { 
    name: "Regalos con vino", 
    slug: "regalos-con-vino", 
    image: "/assets/product5.png" 
  },
  { 
    name: "Cumpleaños", 
    slug: "cumpleanos", 
    image: "/assets/product6.png" 
  },
  { 
    name: "Amor y aniversario", 
    slug: "amor-y-aniversario", 
    image: "/assets/product4.png" 
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Ramo de Rosas Rojas Premium",
    description: "Elegante ramo de 24 rosas rojas frescas de exportación, envueltas en papel decorativo y lazo de seda. Ideal para expresar amor profundo.",
    category: "Ramos de rosas",
    price: "$45.00",
    image: "/assets/product1.png",
    additionalImages: ["/assets/product1.png"],
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
    image: "/assets/product2.png",
    additionalImages: ["/assets/product2.png"],
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
    image: "/assets/product3.png",
    additionalImages: ["/assets/product3.png"],
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
    image: "/assets/product4.png",
    additionalImages: ["/assets/product4.png"],
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
    image: "/assets/product5.png",
    additionalImages: ["/assets/product5.png"],
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
    image: "/assets/product6.png",
    additionalImages: ["/assets/product6.png"],
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
