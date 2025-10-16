import Image from 'next/image'
import Link from 'next/link'

export default function Logo({ 
  size = 'medium', 
  showText = true, 
  href = '/',
  style = {} 
}) {
  const sizeConfig = {
    small: { width: 24, height: 24, fontSize: '16px' },
    medium: { width: 32, height: 32, fontSize: '20px' },
    large: { width: 48, height: 48, fontSize: '28px' },
    xlarge: { width: 80, height: 80, fontSize: '48px' },
    xxlarge: { width: 300, height: 300, fontSize: '80px' }
  }

  const config = sizeConfig[size] || sizeConfig.medium

  const logoContent = (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      ...style
    }}>
      {/* Logo Image */}
      <div style={{
        width: config.width,
        height: config.height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {/* Actual logo image */}
        <Image
          src="/images/boxhawk.png"
          alt="Boxhawk Logo"
          width={config.width}
          height={config.height}
          style={{ 
            objectFit: 'contain',
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        />
      </div>
      
      {/* Logo Text */}
      {showText && (
        <span style={{
          fontSize: config.fontSize,
          fontWeight: 'bold',
          color: '#333'
        }}>
          Boxhawk
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        {logoContent}
      </Link>
    )
  }

  return logoContent
}
