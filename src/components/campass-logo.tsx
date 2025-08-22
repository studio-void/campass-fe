interface CampassLogoProps {
  type?: 'primary' | 'white';
  size?: number;
  className?: string;
}

function CampassLogo({
  type = 'primary',
  size = 24,
  className = '',
}: CampassLogoProps) {
  const logoSrc =
    type === 'white' ? '/images/campass_white.svg' : '/images/campass_logo.svg';

  return (
    <img
      src={logoSrc}
      alt="Campass Logo"
      width={size}
      height={size}
      className={className}
    />
  );
}

export default CampassLogo;
