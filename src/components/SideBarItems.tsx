import { 
  FaGaugeHigh, 
  FaBagShopping, 
  FaBox, 
  FaFileLines, 
  FaGear 
} from 'react-icons/fa6';
import { SidebarTypes } from '@/types/SidebarTypes';

export const SideBarItems: SidebarTypes[] = [
  { id: 'imgsearch', label: '이미지 업로드 검색', icon: <FaGaugeHigh size={18}  /> },
  { id: 'featuresearch', label: '특징 선택 검색', icon: <FaBagShopping size={18} /> },
  
];