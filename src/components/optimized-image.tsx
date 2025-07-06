import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  quality?: number;
  style?: React.CSSProperties;
}

export const OptimizedImage = ({
  src,
  alt,
  width = 600,
  height = 400,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  quality = 75,
  style,
  ...props
}: OptimizedImageProps) => {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
  };

  if (imageError) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <span className="text-gray-400 text-sm">Image failed to load</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      placeholder="empty"
      sizes={sizes}
      quality={quality}
      onError={handleError}
      style={style}
      {...props}
    />
  );
};

// Specific optimized components for common use cases
export const ProductImage = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={300}
    height={300}
    className={`object-cover ${className}`}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 300px"
  />
);

export const AvatarImage = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={40}
    height={40}
    className={`rounded-full object-cover ${className}`}
    sizes="40px"
  />
);

export const HeroImage = ({ src, alt, className = '' }: { src: string; alt: string; className?: string }) => (
  <OptimizedImage
    src={src}
    alt={alt}
    width={1200}
    height={600}
    className={`object-cover ${className}`}
    priority={true}
    sizes="100vw"
    quality={85}
  />
);
