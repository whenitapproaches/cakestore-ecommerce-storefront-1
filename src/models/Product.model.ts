import Shop from "./Shop.model";
import Review from "./Review.model";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  asset: {
    preview: string;
  };
  price: number;
  listPrice: number;
}

export default Product;
