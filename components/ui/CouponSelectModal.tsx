'use client';

import { useState } from "react";
import { PRESET_COUPONS, PresetCoupon } from "@/lib/preset-coupons";

interface CouponSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (coupon: PresetCoupon) => void;
}

export const CouponSelectModal = ({ open, onClose, onSelect }: CouponSelectModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!open) return null;

  const filteredCoupons = PRESET_COUPONS.filter(coupon =>
    coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (coupon.description && coupon.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (coupon: PresetCoupon) => {
    onSelect(coupon);
    onClose();
    setSearchTerm("");
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg max-w-md w-full max-h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-white">쿠폰 선택</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 검색 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <input
            type="text"
            placeholder="쿠폰 이름으로 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white transition-colors"
          />
        </div>

        {/* 쿠폰 리스트 */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredCoupons.length === 0 ? (
            <div className="text-center text-slate-500 dark:text-slate-400 py-8">
              검색 결과가 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCoupons.map((coupon, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(coupon)}
                  className="w-full text-left p-3 bg-slate-50 dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg transition-colors border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-slate-800 dark:text-white">
                      {coupon.name}
                    </span>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {coupon.amount.toLocaleString()}원
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {coupon.percent}% 할인
                      </div>
                    </div>
                  </div>
                  {coupon.description && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {coupon.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
