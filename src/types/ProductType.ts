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
// export interface BarDataType {
//   score: number;
//   label_id: number;
//   label_name: string;
// }

export interface RadarDataType {
  score: number;
  styleName: string;
}

// export interface RecommendResult {
//   file: string;
//   unknown: boolean;
//   topk: BarDataType[];
//   top1_score: number;
//   gap_top1_top2: number;
// }

// export interface RecommendList {
//   internalProducts: RecommendData[];
//   naverProducts: RecommendData[];
//   results?: RecommendResult[];
// }

export interface RecommendList {
  internalProducts: RecommendData[];
  naverProducts: RecommendData[];
  targetTop1Score: number;
  targetTop1Style: string;
  targetTop2Score: number;
  targetTop2Style: string;
  targetTop3Score: number;
  targetTop3Style: string;
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

// export interface BookmarkData {
//   createdAt: string,
//   imageUrl: string,
//   naverProductId: string,
//   productId: string, // 호환성 유지용
//   price: number,
//   productLink: string,
//   title: string,
//   saveId: number,
//   savedStyleName?: string,       // 사용자가 북마크를 저장할 때 선택/분석된 스타일
//   originalStyleName?: string,    // 상품이 원래 가지고 있던 스타일
//   originalStyleScore?: number,   // 상품의 원래 스타일 수치(확률 또는 점수)
// }

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
