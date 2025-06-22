import { MapTilerMap } from './maptiler-map';

interface PropertyMapProps {
  location: string;
  className?: string;
}

export function PropertyMap({ location, className = '' }: PropertyMapProps) {
  return <MapTilerMap location={location} className={className} />;
}