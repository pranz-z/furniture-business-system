export type ChatHistoryMessage = {
  role: 'user' | 'model';
  parts: { text: string }[];
};

export type ProductContext = {
  name: string;
  category: string;
  price: string;
  priceType: string;
  material: string;
  dimensions: string;
  availability: string;
  leadTime: string;
  description: string;
  customizationAvailable: boolean;
};
