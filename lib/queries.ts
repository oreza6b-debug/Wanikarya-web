// Semua pengambilan data lewat file ini. Nanti ganti isinya dengan query Supabase.
import { products, services, villages, womanpreneurs, stores, categories, serviceCategories } from "./data";
import type { Product, Womanpreneur, Service, Village } from "./data";

export const finalPrice = (p: Product) =>
  p.promoPercent ? Math.round(p.price * (1 - p.promoPercent / 100)) : p.price;

export const getStore = (slug: string) => stores.find((s) => s.slug === slug)!;
export const getVillage = (slug: string) => villages.find((v) => v.slug === slug)!;
export const getAllVillages = () => villages;

export function getStats() {
  return {
    villages: villages.length,
    womanpreneurs: womanpreneurs.filter((w) => w.verified).length,
    products: products.length,
    services: services.length,
  };
}

const has = (hay: string, q: string) => hay.toLowerCase().includes(q.toLowerCase());

export type MarketParams = { q?: string; kategori?: string; desa?: string; harga?: string; urut?: string };

export function getProducts(p: MarketParams = {}, source: Product[] = products) {
  const list = source.filter((x) => {
    const store = getStore(x.storeSlug);
    if (p.q && !has(`${x.name} ${x.description} ${store.businessName}`, p.q)) return false;
    if (p.kategori && x.categorySlug !== p.kategori) return false;
    if (p.desa && store.villageSlug !== p.desa) return false;
    const price = finalPrice(x);
    if (p.harga === "murah" && price >= 25000) return false;
    if (p.harga === "sedang" && (price < 25000 || price > 100000)) return false;
    if (p.harga === "mahal" && price <= 100000) return false;
    return true;
  });
  if (p.urut === "termurah") list.sort((a, b) => finalPrice(a) - finalPrice(b));
  else if (p.urut === "termahal") list.sort((a, b) => finalPrice(b) - finalPrice(a));
  else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt)); // terbaru
  return list;
}

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getAllProducts = () => products;

export type ServiceParams = { q?: string; kategori?: string; urut?: string };

export function getServices(p: ServiceParams = {}) {
  const list = services.filter((s) => {
    if (p.q && !has(`${s.name} ${s.description} ${s.category}`, p.q)) return false;
    if (p.kategori && p.kategori !== "semua" && s.categorySlug !== p.kategori) return false;
    return true;
  });
  if (p.urut === "termurah") list.sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
  else if (p.urut === "termahal") list.sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
  else list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return list;
}

export const getService = (slug: string) => services.find((s) => s.slug === slug);
export const getAllServices = () => services;

export type SearchParams = { q?: string; jenis?: string; urut?: string };

export function searchAll({ q = "", jenis = "semua", urut = "relevan" }: SearchParams) {
  const match = (s: string) => !q || has(s, q);
  const show = (j: string) => jenis === "semua" || jenis === j;

  let prods = show("produk")
    ? products.filter((x) => match(`${x.name} ${x.description} ${getStore(x.storeSlug).businessName}`))
    : [];
  let svcs = show("jasa")
    ? services.filter((x) => match(`${x.name} ${x.description} ${x.category}`))
    : [];
  const wps = show("womanpreneur")
    ? womanpreneurs.filter((x) => match(`${x.name} ${x.businessName} ${x.description}`))
    : [];
  const vils = show("desa")
    ? villages.filter((x) => match(`${x.name} ${x.description}`))
    : [];

  if (urut === "termurah") {
    prods = [...prods].sort((a, b) => finalPrice(a) - finalPrice(b));
    svcs = [...svcs].sort((a, b) => (a.priceFrom ?? 0) - (b.priceFrom ?? 0));
  } else if (urut === "termahal") {
    prods = [...prods].sort((a, b) => finalPrice(b) - finalPrice(a));
    svcs = [...svcs].sort((a, b) => (b.priceFrom ?? 0) - (a.priceFrom ?? 0));
  } else if (urut === "terbaru") {
    prods = [...prods].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    svcs = [...svcs].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return { prods, svcs, wps, vils, total: prods.length + svcs.length + wps.length + vils.length };
}

export type WomanpreneurParams = { q?: string; kategori?: string; desa?: string; urut?: string };

export function getWomanpreneurs(p: WomanpreneurParams = {}) {
  const list = womanpreneurs.filter((w) => {
    if (p.q && !has(`${w.name} ${w.businessName} ${w.category} ${w.description} ${w.quote}`, p.q)) return false;
    if (p.kategori) {
      const katLower = p.kategori.toLowerCase();
      const matchCat =
        w.category.toLowerCase().includes(katLower) ||
        categories.some((c) => c.slug === katLower && w.category.toLowerCase().includes(c.name.toLowerCase()));
      if (!matchCat) return false;
    }
    if (p.desa && w.villageSlug !== p.desa) return false;
    return true;
  });

  if (p.urut === "terlama") {
    list.sort((a, b) => a.since - b.since);
  } else if (p.urut === "nama") {
    list.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    list.sort((a, b) => b.since - a.since); // terbaru
  }
  return list;
}

export const getWomanpreneur = (slug: string) => womanpreneurs.find((w) => w.slug === slug);
export const getAllWomanpreneurs = () => womanpreneurs;
export const getProductsByStore = (storeSlug: string) => products.filter((p) => p.storeSlug === storeSlug);
export const getServicesByStore = (storeSlug: string) => services.filter((s) => s.storeSlug === storeSlug);
