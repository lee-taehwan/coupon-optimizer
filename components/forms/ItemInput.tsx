'use client';
import { useState } from "react";
import { InputModal } from "@/components/ui";
import { v4 as uuidv4 } from 'uuid';
import { useSpring, animated, useTransition } from '@react-spring/web';
import { Product, Coupon } from "@/store/InputContext";

type Item = Product | Coupon;

const AnimatedCount = ({ count, unit }: { count: number; unit: string }) => {
  const { number } = useSpring({ number: count, config: { tension: 170, friction: 26 } });
  return (
    <span>
      <animated.span>{number.to((n) => Math.round(n).toLocaleString())}</animated.span>{unit}
    </span>
  );
}

const AnimatedNumber = ({ value }: { value: number }) => {
  const { number } = useSpring({ number: value, config: { tension: 170, friction: 26 } });
  return <animated.span>{number.to((n) => Math.round(n).toLocaleString())}</animated.span>;
}

interface ItemInputProps<T extends Item> {
  type: 'product' | 'coupon';
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
}

export const ItemInput = <T extends Item>({
  type,
  items,
  setItems
}: ItemInputProps<T>) => {
  const [input, setInput] = useState("");
  const [percent, setPercent] = useState("40");
  const [count, setCount] = useState("1");
  const [modalMsg, setModalMsg] = useState("");
  const [isComposing, setIsComposing] = useState(false);

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

  // 숫자 입력 검증 및 알럿
  const handleNumericKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // 모달이 열려 있을 때는 키 이벤트 처리하지 않음
    if (modalMsg) {
      e.preventDefault();
      return;
    }
    
    // 허용할 키들: 숫자, Backspace, Delete, Tab, Enter, Arrow keys 등
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Enter', 'Escape',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End'
    ];
    
    // 숫자 키 (0-9)와 허용된 키들은 통과
    if (
      (e.key >= '0' && e.key <= '9') || 
      allowedKeys.includes(e.key) ||
      e.ctrlKey || e.metaKey // Ctrl+A, Ctrl+C 등 허용
    ) {
      if (e.key === "Enter") handleAddItem();
      return;
    }
    
    // 숫자가 아닌 문자 입력 시 알럿 띄우고 입력 차단
    e.preventDefault();
    setModalMsg("숫자만 입력가능합니다.");
  };

  // 숫자만 입력 가능하도록 필터링 (복사&붙여넣기 대응)
  const handleNumericInput = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    
    // 숫자가 아닌 문자가 제거되었다면 알럿 표시
    if (value !== numericValue && value.length > 0) {
      setModalMsg("숫자만 입력가능합니다.");
    }
    
    return numericValue;
  };

  // IME 입력 시작 처리
  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  // IME 입력 종료 처리
  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    
    // 모달이 열려 있을 때는 처리하지 않음
    if (modalMsg) {
      return;
    }
    
    const value = e.currentTarget.value;
    const numericValue = value.replace(/[^0-9]/g, "");
    
    if (value !== numericValue) {
      setModalMsg("숫자만 입력가능합니다.");
      // 입력 필드에 따라 적절한 state 업데이트
      const fieldName = e.currentTarget.name;
      if (fieldName.includes('amount')) {
        setInput(numericValue);
      } else if (fieldName.includes('percent')) {
        setPercent(numericValue);
      } else if (fieldName.includes('count')) {
        setCount(numericValue);
      }
    }
  };

  const totalAmount = currentConfig.showTotal ? items.reduce((sum, item) => {
    if (type === 'product') {
      return sum + ((item as Product).price * (item.count || 1));
    }
    return sum;
  }, 0) : 0;

  // 리스트 애니메이션 트랜지션 생성
  const transitions = useTransition(items, {
    from: { opacity: 0, y: 20, scale: 0.1 },
    enter: { opacity: 1, y: 0, scale: 0.1 },
    leave: { opacity: 0, y: -20, scale: 0.1 },
    keys: items.map(getItemKey),
    config: { tension: 170, friction: 26 },
  });

  return (
    <section className="bg-slate-100 dark:bg-slate-800 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-2 text-slate-800 dark:text-gray-200">{currentConfig.title}</h2>
      <InputModal open={!!modalMsg} message={modalMsg} onClose={() => setModalMsg("")} />
      <div className="flex gap-2 mb-2 items-center">
        <input
          name={`${type}-amount`}
          id={`${type}-amount`}
          type="number"
          min={1}
          placeholder={currentConfig.placeholder}
          className={`border rounded px-3 py-2 ${currentConfig.showPercent ? 'flex-1 min-w-0' : 'w-full'} focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white transition-colors`}
          value={input}
          onChange={(e) => setInput(handleNumericInput(e.target.value))}
          onKeyDown={handleNumericKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
        {currentConfig.showPercent && (
          <input
            name={`${type}-percent`}
            id={`${type}-percent`}
            type="number"
            min={1}
            max={100}
            placeholder="퍼센트"
            className="border rounded h-[42px] w-[60px] px-0 py-0 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white transition-colors"
            value={percent}
            onChange={(e) => setPercent(handleNumericInput(e.target.value))}
            onFocus={() => setPercent("")}
            onKeyDown={handleNumericKeyDown}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
          />
        )}
        <input
          name={`${type}-count`}
          id={`${type}-count`}
          type="number"
          min={1}
          placeholder="수량"
          className="border rounded h-[42px] w-[42px] px-0 py-0 text-center focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white transition-colors"
          value={count}
          onChange={(e) => setCount(handleNumericInput(e.target.value))}
          onFocus={() => setCount("")}
          onKeyDown={handleNumericKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
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
        {items.length === 0 ? (
          <div
            className="text-slate-500 text-sm text-center py-2"
          >
            {currentConfig.emptyMessage}
          </div>
        ) : (
          <ul className="space-y-1">
            {transitions((style, item) => {
              const key = getItemKey(item);
              return (
                <animated.li
                  key={key}
                  style={{
                    ...style,
                    transform: style.y.to((y) => `translateY(${y}px)`) + ' ' + style.scale.to((s) => `scale(${s})`),
                  }}
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
                </animated.li>
              );
            })}
          </ul>
        )}
      </div>
      {currentConfig.showTotal && items.length > 0 && (
        <div className="mt-3 bg-white dark:bg-slate-700 rounded-lg p-3 text-center text-slate-700 dark:text-gray-300 font-bold shadow-inner transition-colors">
          {currentConfig.totalTitle}: <AnimatedNumber value={totalAmount} />원
        </div>
      )}
    </section>
  );
} 