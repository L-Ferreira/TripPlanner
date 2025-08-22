import { GB, PT } from 'country-flag-icons/react/1x1';
import React from 'react';

interface FlagIconProps {
  className?: string;
  size?: number;
}

export const PortugalFlag: React.FC<FlagIconProps> = ({ className = '', size = 16 }) => (
  <PT width={size} height={size} className={className} style={{ borderRadius: '50%' }} />
);

export const UKFlag: React.FC<FlagIconProps> = ({ className = '', size = 16 }) => (
  <GB width={size} height={size} className={className} style={{ borderRadius: '50%' }} />
);
