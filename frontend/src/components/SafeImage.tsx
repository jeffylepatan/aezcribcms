"use client";
import React, { ImgHTMLAttributes, useEffect, useState } from 'react';

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
  // when true, the component will render nothing if the image fails to load
  hideOnError?: boolean;
  // optional textual fallback to render when the image fails (e.g. 'Ac')
  textFallback?: string;
};

export default function SafeImage({ src, alt = '', fallback, hideOnError = false, textFallback, ...rest }: SafeImageProps) {
  const defaultFallback = fallback ?? 'https://aezcrib.xyz/app/sites/default/files/assets/images/noImage.png';
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(typeof src === 'string' ? src : undefined);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setCurrentSrc(typeof src === 'string' ? src : undefined);
    setErrored(false);
  }, [src]);

  // Extract className/style so we can reuse for text fallback
  const { className, style, ...imgProps } = rest as any;

  // If errored, prefer textual fallback, then hide, otherwise allow img to show default fallback
  if (errored) {
    if (typeof textFallback === 'string') {
      return <span className={className} style={style}>{textFallback}</span>;
    }
    if (hideOnError) return null;
  }

  const externalOnError = imgProps.onError;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        try {
          if (!errored) {
            setErrored(true);
            // If textFallback is provided we don't change currentSrc — the component will render the text instead
            if (textFallback) {
              // call external handler if provided
              if (typeof externalOnError === 'function') {
                try { externalOnError(e); } catch {};
              }
              return;
            }
            if (hideOnError) {
              if (typeof externalOnError === 'function') {
                try { externalOnError(e); } catch {};
              }
              return;
            }
            if (currentSrc !== defaultFallback) {
              setCurrentSrc(defaultFallback);
            }
          }
        } finally {
          // ensure external handler still runs
          if (typeof externalOnError === 'function') {
            try { externalOnError(e); } catch {}
          }
        }
      }}
      {...imgProps}
    />
  );
}
