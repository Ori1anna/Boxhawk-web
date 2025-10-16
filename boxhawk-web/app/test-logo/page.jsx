'use client'
import Logo from '@/components/Logo'

export default function TestLogoPage() {
  return (
    <div style={{ 
      padding: '40px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ marginBottom: '40px', textAlign: 'center' }}>
        Logo 测试页面
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        
        {/* Small Logo */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Small (24x24px)</h3>
          <Logo size="small" href={null} />
        </div>

        {/* Medium Logo */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Medium (32x32px)</h3>
          <Logo size="medium" href={null} />
        </div>

        {/* Large Logo */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Large (48x48px)</h3>
          <Logo size="large" href={null} />
        </div>

        {/* XLarge Logo */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px' }}>XLarge (80x80px)</h3>
          <Logo size="xlarge" href={null} />
        </div>

        {/* Logo without text */}
        <div style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px' }}>Logo Only (no text)</h3>
          <Logo size="large" href={null} showText={false} />
        </div>

        {/* Logo with custom style */}
        <div style={{
          backgroundColor: '#6c5ce7',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <h3 style={{ marginBottom: '20px', color: 'white' }}>Custom Style</h3>
          <Logo size="large" href={null} style={{ color: 'white' }} />
        </div>

      </div>

      <div style={{
        marginTop: '40px',
        textAlign: 'center',
        color: '#666'
      }}>
        <p>访问 <a href="/" style={{ color: '#6c5ce7' }}>首页</a> 和 <a href="/landing" style={{ color: '#6c5ce7' }}>Landing 页面</a> 查看实际使用效果</p>
      </div>
    </div>
  )
}
