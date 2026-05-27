import Image from 'next/image';

interface AuditMarkProps {
  compact?: boolean;
  className?: string;
}

export default function AuditMark({ compact = false, className = '' }: AuditMarkProps) {
  // Aumentamos el tamaño base nuevamente
  const size = compact ? 44 : 52;

  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center border border-signal/55 bg-[#0A0E14] overflow-hidden ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image 
        src="/logo.png" 
        alt="True Audit Logo" 
        width={size} 
        height={size} 
        className="object-cover scale-[1.55]"
      />
    </span>
  );
}
