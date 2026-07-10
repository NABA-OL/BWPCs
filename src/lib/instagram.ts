// Desarrollado por BlacKraken Solutions
export function isInstagramUrl(url: string): boolean {
  return /instagram\.com\/(p|reel|tv)\//.test(url);
}
