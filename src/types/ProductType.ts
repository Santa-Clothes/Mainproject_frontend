export interface ProductType {
  id: string;
  name: string;
  brand: string;
  price: number;
  imgUrl: string;
  category: string;
}

export interface ProductData {
  productId: string,
  productName: string,
  price: number,
  categoryName: string
  imageUrl: string
}

export interface RecommendData {
  productId: string,
  title: string,
  price: number,
  imageUrl: string,
  productLink: string,
  similarityScore?: number
}

export interface InternalStyleCount {
  styleName: string;
  count: number;
}

export interface AnalysisResult {
  dimension: number,
  similarProducts: RecommendData[],
  embedding: number[]
}