export function rupiah(n: number) {
  return "Rp" + new Intl.NumberFormat("id-ID").format(n);
}
