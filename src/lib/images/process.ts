/*
 * Propiedad de BlacKraken Solutions <blackraken.com>
 * Desarrollado por: NABAOL
 * Fecha de creación: 2026-09-18
 * Correo: nabaol.dev@gmail.com
 * Copyright (c) 2026 BlacKraken Solutions. Todos los derechos reservados.
 */
import sharp from "sharp";

/** Límite de píxeles de entrada (evita bombas de descompresión). */
const MAX_INPUT_PIXELS = 40_000_000; // una foto de celular ronda 12-50 MP; 40 MP cubre casi todas
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp"]);

const FULL = { size: 1600, quality: 80 };
const THUMB = { size: 480, quality: 75 };

/** Error apto para mostrarle al usuario (mensaje en español). */
export class ImageError extends Error {}

export interface ProcessedImage {
  full: Buffer;
  thumb: Buffer;
  width: number;
  height: number;
}

/**
 * Prepara una foto subida: valida el formato leyendo el contenido (no el
 * nombre ni el tipo declarado), aplica la orientación EXIF, quita TODOS los
 * metadatos (ubicación GPS, cámara, fechas) y la reduce a WebP con pérdida
 * imperceptible, más una miniatura. Nunca amplía imágenes pequeñas.
 */
export async function processImage(input: Buffer): Promise<ProcessedImage> {
  try {
    const source = sharp(input, {
      limitInputPixels: MAX_INPUT_PIXELS,
      failOn: "error",
      sequentialRead: true,
    });
    const { format } = await source.metadata();
    if (!format || !ALLOWED_FORMATS.has(format)) {
      throw new ImageError("Formato no admitido. Usa una foto JPG, PNG o WebP.");
    }

    // La imagen se decodifica UNA vez (la grande); la miniatura sale de la ya
    // reducida, que pesa una fracción. Así el costo de CPU es el de una decodificación.
    const full = await source
      .clone()
      .rotate() // aplica la orientación EXIF antes de quitar los metadatos
      .resize({ width: FULL.size, height: FULL.size, fit: "inside", withoutEnlargement: true })
      .webp({ quality: FULL.quality })
      .toBuffer({ resolveWithObject: true });
    const thumb = await sharp(full.data)
      .resize({ width: THUMB.size, height: THUMB.size, fit: "inside", withoutEnlargement: true })
      .webp({ quality: THUMB.quality })
      .toBuffer();
    return {
      full: full.data,
      thumb,
      width: full.info.width,
      height: full.info.height,
    };
  } catch (error) {
    if (error instanceof ImageError) throw error;
    throw new ImageError("No pudimos leer la imagen. Prueba con otra foto.");
  }
}

const PROOF = { size: 2000, quality: 85 };

/**
 * Prepara un comprobante de pago: solo imágenes (JPG, PNG o WebP, validadas por su
 * contenido), orientadas y SIN metadatos, re-codificadas a WebP. Se conserva más
 * resolución que en una foto de reseña para que se lean los números.
 */
export async function processProofImage(
  input: Buffer,
): Promise<{ data: Buffer; width: number; height: number }> {
  try {
    const source = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error", sequentialRead: true });
    const { format } = await source.metadata();
    if (!format || !ALLOWED_FORMATS.has(format)) {
      throw new ImageError("Formato no admitido. Sube una imagen JPG, PNG o WebP del comprobante.");
    }
    const out = await source
      .rotate()
      .resize({ width: PROOF.size, height: PROOF.size, fit: "inside", withoutEnlargement: true })
      .webp({ quality: PROOF.quality })
      .toBuffer({ resolveWithObject: true });
    return { data: out.data, width: out.info.width, height: out.info.height };
  } catch (error) {
    if (error instanceof ImageError) throw error;
    throw new ImageError("No pudimos leer la imagen. Prueba con otra captura o foto.");
  }
}
