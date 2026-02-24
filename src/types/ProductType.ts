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
export interface BarDataType {
  score: number;
  label_id: number;
  label_name: string;
}

export interface RecommendResult {
  file: string;
  unknown: boolean;
  topk: BarDataType[];
  top1_score: number;
  top2_score: number;
  gap_top1_top2: number;
}

export interface RecommendList {
  internalProducts: RecommendData[];
  naverProducts: RecommendData[];
  results?: RecommendResult[];
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

// export interface AnalysisResult {
//   dimension: number,
//   similarProducts: RecommendData[],
//   results?: RecommendResult[]
// }