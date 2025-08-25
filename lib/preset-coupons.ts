import { Coupon } from "@/store/InputContext";

export interface PresetCoupon {
  name: string;
  amount: number;
  percent: number;
  description?: string;
}

export const PRESET_COUPONS: PresetCoupon[] = [
  {
    name: "OY 할인",
    amount: 50000,
    percent: 40,
    description: "올리브영 분기 할인 쿠폰"
  }
];

export const convertPresetToCoupon = (preset: PresetCoupon): Omit<Coupon, 'id'> => ({
  amount: preset.amount,
  percent: preset.percent,
  count: 1
});
