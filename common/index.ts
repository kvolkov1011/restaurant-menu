export type Category = {
  id: string;
  name: string;
}

export type MenuItem = {
  id: string;
  categoryId: Category['id'];
  name: string;
  description?: string;
  price: number;
  userPrice?: boolean;
  enabled: boolean;
}
