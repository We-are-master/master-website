import React, { useState, useRef, useEffect } from 'react';

/**
 * Optimized Image Component
 * - Lazy loading
 * - Prevents layout shift with aspect ratio
 * - Loading placeholder
 * - Error handling
 */
const OptimizedImage = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  style = {},
  loading = 'lazy',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [aspectRatio, setAspectRatio] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (width && height) {
      setAspectRatio((height / width) * 100);
    }
  }, [width, height]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    ...(aspectRatio && { paddingBottom: `${aspectRatio}%` }),
    ...(width && !aspectRatio && { width }),
    ...(height && !aspectRatio && { height }),
    ...style
  };

  const imageStyle = {
    position: aspectRatio ? 'absolute' : 'relative',
    top: 0,
    left: 0,
    width: '100%',
    height: aspectRatio ? '100%' : 'auto',
    objectFit: 'cover',
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };

  if (hasError) {
    return (
      <div
        className={className}
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#9ca3af',
          fontSize: '0.875rem'
        }}
        {...props}
      >
        {alt || 'Image'}
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle} {...props}>
      {!isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#f3f4f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#E94A02',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }}
          />
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        style={imageStyle}
        decoding="async"
      />
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OptimizedImage;
