"use client";
import React, { ImgHTMLAttributes, useEffect, useState } from 'react';

type SafeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  fallback?: string;
  // when true, the component will render nothing if the image fails to load
  hideOnError?: boolean;
};

export default function SafeImage({ src, alt = '', fallback, hideOnError = false, ...rest }: SafeImageProps) {
  const defaultFallback = fallback ?? 'https://aezcrib.xyz/app/sites/default/files/assets/images/noImage.png';
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(typeof src === 'string' ? src : undefined);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setCurrentSrc(typeof src === 'string' ? src : undefined);
    setErrored(false);
  }, [src]);

  if (hideOnError && errored) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (!errored) {
          setErrored(true);
          if (hideOnError) {
            // leaving currentSrc as-is; rendering will return null because of hideOnError
            return;
          }
          if (currentSrc !== defaultFallback) {
            setCurrentSrc(defaultFallback);
          }
        }
      }}
      {...rest}
    />
  );
}
