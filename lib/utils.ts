import { Product, Coupon } from "@/store/InputContext";

export const encodeInputToQuery = (products: Product[], coupons: Coupon[]) => {
  const p = products.map((pr) => `${pr.price}x${pr.count}`).join(",");
  const c = coupons.map((cu) => `${cu.amount}x${cu.percent}x${cu.count}`).join(",");
  return `p=${encodeURIComponent(p)}&c=${encodeURIComponent(c)}`;
}

export const decodeQueryToInput = (query: string) => {
  const params = new URLSearchParams(query);
  const p = params.get("p") || "";
  const c = params.get("c") || "";
  const products: Product[] = p
    ? p.split(",").filter(Boolean).map((v) => {
        const [price, count] = v.split("x").map(Number);
        return { price, count: count || 1 };
      }).filter((v) => !isNaN(v.price) && v.price > 0 && !isNaN(v.count) && v.count > 0)
    : [];
  const coupons: Coupon[] = c
    ? c.split(",").filter(Boolean).map((v) => {
        const [amount, percent, count] = v.split("x").map(Number);
        return { amount, percent, count };
      }).filter((v) => !isNaN(v.amount) && !isNaN(v.percent) && !isNaN(v.count) && v.amount > 0 && v.percent > 0 && v.count > 0)
    : [];
  return { products, coupons };
} 