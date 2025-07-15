'use client';
import { useState, useEffect } from "react";
import { InputModal } from "@/_components/ui";
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Product, Coupon } from "@/store/InputContext";

type Item = Product | Coupon;

function AnimatedCount({ count, unit }: { count: number; unit: string }) {
  const [displayCount, setDisplayCount] = useState(count);

  useEffect(() => {
    const controls = animate(displayCount, count, {
      duration: 0.5,
      onUpdate: (value) => setDisplayCount(Math.round(value))
    });
    return controls.stop;
  }, [count]);

  return <span>{displayCount.toLocaleString()}{unit}</span>;
}

interface ItemInputProps<T extends Item> {
  type: 'product' | 'coupon';
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export default function ItemInput<T extends Item>({
  type,
  items,
  setItems
}: ItemInputProps<T>) {
  const [input, setInput] = useState("");
  const [percent, setPercent] = useState("40");
  const [count, setCount] = useState("1");
  const [modalMsg, setModalMsg] = useState("");

  const config = {
    product: {
      placeholder: "금액",
      emptyMessage: "상품을 입력해 주세요.",
      unit: "개",
      showPercent: false,
      showTotal: true,
      title: "상품 입력",
      totalTitle: "총 상품 금액"
    },
    coupon: {
      placeholder: "금액",
      emptyMessage: "쿠폰을 입력해 주세요.",
      unit: "장",
      showPercent: true,
      showTotal: false,
      title: "쿠폰 입력",
      totalTitle: "총 쿠폰 금액"
    }
  };

  const currentConfig = config[type];

  const getItemPrice = (item: T) => {
    return type === 'product' ? (item as Product).price : (item as Coupon).amount;
  };

  const getItemKey = (item: T) => {
    return getItemPrice(item);
  };

  const getItemDisplay = (item: T) => {
    const price = getItemPrice(item);
    if (type === 'product') {
      return `${price.toLocaleString()}원`;
    } else {
      return `${price.toLocaleString()}원 / ${(item as Coupon).percent}%`;
    }
  };

  const addItem = (values: { input: number; count: number; percent?: number }) => {
    setItems((prev) => {
      const idx = prev.findIndex((item) => {
        if (type === 'product') {
          return (item as Product).price === values.input;
        }
        return (item as Coupon).amount === values.input && (item as Coupon).percent === values.percent;
      });

      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], count: next[idx].count + values.count };
        return next;
      } else {
        if (type === 'product') {
          return [...prev, { price: values.input, count: values.count, id: uuidv4() } as unknown as T];
        }
        return [...prev, { amount: values.input, percent: values.percent, count: values.count, id: uuidv4() } as unknown as T];
      }
    });
  };

  const removeItem = (key: number) => {
    setItems((prev) => prev.filter((item) => getItemPrice(item) !== key));
  };

  const handleRemoveItem = (key: number) => {
    removeItem(key);
  };

  const validateInput = (values: { input: number, count: number, percent?: number }) => {
    if (isNaN(values.input) || values.input <= 0) {
      return type === 'product' ? "상품 금액을 입력해 주세요." : "최대 할인 금액을 입력해 주세요.";
    }
    if (isNaN(values.count) || values.count <= 0) {
      return "수량을 1 이상으로 입력해 주세요.";
    }
    if (type === 'coupon' && (values.percent === undefined || isNaN(values.percent) || values.percent <= 0 || values.percent > 100)) {
      return "할인 퍼센트를 1~100 사이로 입력해 주세요.";
    }
    return null;
  };

  const handleAddItem = () => {
    const values = {
      input: parseInt(input.replace(/[^0-9]/g, ""), 10),
      percent: currentConfig.showPercent ? parseInt(percent.replace(/[^0-9]/g, ""), 10) : undefined,
      count: parseInt(count.replace(/[^0-9]/g, ""), 10)
    };

    const error = validateInput(values);
    if (error) {
      setModalMsg(error);
      return;
    }

    addItem(values);
    setInput("");
    if (currentConfig.showPercent) setPercent("40");
    setCount("1");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAddItem();
  };

  const totalAmount = currentConfig.showTotal ? items.reduce((sum, item) => {
    if (type === 'product') {
      return sum + ((item as Product).price * (item.count || 1));
    }
    return sum;
  }, 0) : 0;

  const [animatedTotal, setAnimatedTotal] = useState(totalAmount);

  useEffect(() => {
    const controls = animate(animatedTotal, totalAmount, {
      duration: 0.5,
      onUpdate: (value) => setAnimatedTotal(Math.round(value))
    });
    return controls.stop;
  }, [totalAmount]);

  return (
    <section className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-gray-200">{currentConfig.title}</h2>
      <InputModal open={!!modalMsg} message={modalMsg} onClose={() => setModalMsg("")} />
      <div className="flex gap-2 mb-2 items-center">
        <input
          type="number"
          min={1}
          placeholder={currentConfig.placeholder}
          className={`border rounded px-3 py-2 ${currentConfig.showPercent ? 'flex-1 min-w-0' : 'w-full'} focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white transition-colors`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        {currentConfig.showPercent && (
          <input
            type="number"
            min={1}
            max={100}
            placeholder="퍼센트"
            className="border rounded h-[42px] w-[60px] px-0 py-0 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white transition-colors"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            onFocus={() => setPercent("")}
            onKeyDown={handleKeyDown}
          />
        )}
        <input
          type="number"
          min={1}
          placeholder="수량"
          className="border rounded h-[42px] w-[42px] px-0 py-0 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white transition-colors"
          value={count}
          onChange={(e) => setCount(e.target.value)}
          onFocus={() => setCount("")}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center justify-center h-[42px] w-[42px] bg-slate-600 text-white rounded hover:bg-slate-700 transition shrink-0"
          aria-label={`${type === 'product' ? '상품' : '쿠폰'} 추가`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
      <div className="min-h-[34px]">
        <AnimatePresence mode="wait">
          {items.length === 0 ? (
            <motion.div
              key="empty-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-500 text-sm text-center py-2"
            >
              {currentConfig.emptyMessage}
            </motion.div>
          ) : (
            <motion.ul
              key="items-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-1"
            >
              <AnimatePresence>
                {items.map(item => {
                  const key = getItemKey(item);
                  return (
                    <motion.li
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      className="flex items-center justify-between bg-white dark:bg-slate-700 rounded px-3 py-1 text-slate-700 dark:text-gray-300 transition-colors"
                    >
                      <span>
                        {getItemDisplay(item)} ×
                        <span className="ml-1">
                          <AnimatedCount count={item.count} unit={currentConfig.unit} />
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(key)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 transition-colors text-xs ml-2"
                      >
                        삭제
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
      {currentConfig.showTotal && items.length > 0 && (
        <div className="mt-3 bg-slate-200 dark:bg-slate-700 rounded-lg p-3 text-center text-slate-800 dark:text-slate-200 font-bold shadow-inner transition-colors">
          {currentConfig.totalTitle}: {animatedTotal.toLocaleString()}원
        </div>
      )}
    </section>
  );
} 