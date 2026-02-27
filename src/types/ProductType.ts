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

export interface RadarDataType {
  score: number;
  styleName: string;
}

export interface RecommendList512 {
  internalProducts: RecommendData[];
  naverProducts: RecommendData[];
  results: RecommendResult512[];
}

export interface RecommendResult512 {
  file: string;
  unknown: boolean;
  topk: RecommendStyle512[];
  top1_score: number;
  gap_top1_top2: number;
}

export interface RecommendStyle512 {
  label_id: number;
  label_name: string;
  score: number;
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

export interface BookmarkData {
  createdAt: string,
  imageUrl: string,
  naverProductId: string,
  price: number,
  productLink: string,
  saveId: number,
  styleScore1_512: number,
  styleScore1_768: number,
  styleTop1_512: string,
  styleTop1_768: string,
  title: string,
  userStyle: string | null,
}

export interface RecommendStyle768 {
  style: string,
  score: number
}

export interface RecommendResult768 {
  dimension: number,
  styles: RecommendStyle768[],
  internalProducts: RecommendData[],
  naverProducts: RecommendData[],
}

export interface SelectionRecommendResult {
  naverProducts: RecommendData[],
  internalProducts: RecommendData[],
  targetTop1Style: string,
  targetTop1Score: number,
  targetTop2Style: string,
  targetTop2Score: number,
  targetTop3Style: string,
  targetTop3Score: number,
}
