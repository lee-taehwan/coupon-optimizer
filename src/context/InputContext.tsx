'use client';
import React, { createContext, useContext, useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';

export interface Product {
  price: number;
  count: number;
  id?: string;
}
export interface Coupon {
  amount: number;
  percent: number;
  count: number;
  id?: string;
}

interface InputContextProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  coupons: Coupon[];
  setCoupons: React.Dispatch<React.SetStateAction<Coupon[]>>;
}

const InputContext = createContext<InputContextProps | undefined>(undefined);

export const InputProvider = ({ children }: { children: React.ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    try {
      const p = localStorage.getItem("products");
      const c = localStorage.getItem("coupons");
      if (p) {
        const arr: Product[] = JSON.parse(p);
        if (Array.isArray(arr)) {
          setProducts(arr.map((prod) => prod.id ? prod : { ...prod, id: uuidv4() }));
        } else {
          setProducts([]);
        }
      }
      if (c) {
        const arr: Coupon[] = JSON.parse(c);
        if (Array.isArray(arr)) {
          setCoupons(arr.map((cu) => ({
            ...cu,
            percent: typeof cu.percent === "number" && cu.percent > 0 ? cu.percent : 40
          })));
        } else {
          setCoupons([]);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("products", JSON.stringify(products));
    } catch {}
  }, [products]);
  useEffect(() => {
    try {
      localStorage.setItem("coupons", JSON.stringify(coupons));
    } catch {}
  }, [coupons]);

  return (
    <InputContext.Provider value={{ products, setProducts, coupons, setCoupons }}>
      {children}
    </InputContext.Provider>
  );
};

export const useInputContext = () => {
  const ctx = useContext(InputContext);
  if (!ctx) throw new Error("useInputContext must be used within InputProvider");
  return ctx;
}; 