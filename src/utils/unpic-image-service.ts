import { env } from 'node:process';
import {
  getSrcSetEntries,
  inferImageDimensions,
  normalizeImageType,
  transformProps,
} from '@unpic/core';
import { transformUrl } from 'unpic';
import sharpImageService from 'astro/assets/services/sharp';

// Réplique de @unpic/astro/dist/service/base.js + sharp.js, construite à
// partir des imports PUBLICS (@unpic/core, unpic) — @unpic/astro n'expose pas
// son service (exports map = ".", "./base", "./service" uniquement).
// Seule différence : stringification de l'objet `style` retourné par
// transformProps/getStyle, sinon Astro sérialise style="[object Object]".

function getDefaultService(): string {
  if (env.NETLIFY || env.NETLIFY_LOCAL || 'Netlify' in globalThis) {
    return 'netlify';
  }
  if (env.VERCEL || env.NOW_BUILDER) {
    return 'vercel';
  }
  return 'astro';
}

function getEndpointOptions(imageConfig: any, options: Record<string, any> = {}) {
  options.astro ??= {};
  options.astro.endpoint =
    typeof imageConfig?.endpoint === 'object'
      ? imageConfig?.endpoint?.route
      : imageConfig?.endpoint;
  return options;
}

function getCdn(imageConfig: any): string {
  if (
    !imageConfig.fallbackService ||
    imageConfig.fallbackService === 'sharp' ||
    imageConfig.fallbackService === 'squoosh'
  ) {
    return getDefaultService();
  }
  return imageConfig.fallbackService;
}

function getTransformOptions(options: any, unpicConfig: any) {
  const cdn = getCdn(unpicConfig);
  const { widths: breakpoints, densities, ...transform } = options;
  if (typeof options.src !== 'string') {
    return {
      cdn,
      ...transform,
      ...inferImageDimensions(options, options.src),
      url: options.src.src,
    };
  }
  return { cdn, ...transform, url: options.src };
}

function stringifyStyle(style: Record<string, unknown>): string {
  return Object.entries(style)
    .filter(([, value]) => typeof value === 'string' && value !== '')
    .map(([key, value]) => `${key}:${value};`)
    .join(' ');
}

const service = {
  getURL(options: any, imageConfig: any): string {
    const transformOptions = getTransformOptions(
      options,
      imageConfig.service.config,
    );
    const providerOptions = getEndpointOptions(imageConfig);
    return transformUrl(transformOptions, {}, providerOptions)?.toString() ?? '';
  },
  getSrcSet(options: any, imageConfig: any) {
    const attributes = options.format
      ? { type: normalizeImageType(options.format) }
      : undefined;
    const transformOptions = getTransformOptions(
      options,
      imageConfig.service.config,
    );
    const cdnOptions = getEndpointOptions(imageConfig);
    const entries = getSrcSetEntries({
      ...transformOptions,
      options: cdnOptions,
      src: transformOptions.url,
    });
    return entries.map(({ width, height }) => ({
      transform: {
        ...options,
        width: Number(width),
        height: Number(height),
      },
      descriptor: `${width}w`,
      attributes,
    }));
  },
  validateOptions(options: any) {
    if (options.densities) {
      console.warn('The densities option is not supported by the unpic image service');
    }
    return options;
  },
  getHTMLAttributes(options: any, imageConfig: any): Record<string, any> {
    const transformOptions = getTransformOptions(
      options,
      imageConfig.service.config,
    );
    const { src, srcset, ...props } = transformProps({
      ...transformOptions,
      src: transformOptions.url.toString(),
    });
    if (props.style && typeof props.style === 'object') {
      props.style = stringifyStyle(props.style as Record<string, unknown>);
    }
    return props;
  },
  transform: sharpImageService.transform,
  parseURL: sharpImageService.parseURL,
};

export default service;
