# Logo 设置说明

## 如何添加你的 Boxhawk Logo

### 1. 准备 Logo 图片
- 将你的 logo 图片保存为 `boxhawk-logo.png` 或 `boxhawk-logo.svg`
- 推荐格式：PNG（透明背景）或 SVG（矢量图）
- 推荐尺寸：至少 200x200 像素

### 2. 放置 Logo 文件
将 logo 文件放到以下位置：
```
boxhawk-web/public/images/boxhawk-logo.png
```

### 3. 更新 Logo 组件
编辑 `components/Logo.jsx` 文件，将以下代码：

```jsx
{/* Placeholder for logo image */}
<span style={{ fontSize: `${config.width * 0.6}px` }}>🦅</span>
```

替换为：

```jsx
{/* Actual logo image */}
<Image
  src="/images/boxhawk-logo.png"
  alt="Boxhawk Logo"
  width={config.width}
  height={config.height}
  style={{ objectFit: 'contain' }}
/>
```

### 4. 添加 Next.js Image 导入
确保在 `components/Logo.jsx` 文件顶部有：

```jsx
import Image from 'next/image'
```

### 5. Logo 组件使用方式

#### 在 Header 中使用（小尺寸）
```jsx
<Logo size="medium" href="/" />
```

#### 在 Landing 页面中使用（大尺寸）
```jsx
<Logo size="xlarge" href={null} showText={true} style={{ color: 'white' }} />
```

#### 可用尺寸
- `small`: 24x24px
- `medium`: 32x32px  
- `large`: 48x48px
- `xlarge`: 80x80px

#### 可用属性
- `size`: 控制 logo 大小
- `showText`: 是否显示 "Boxhawk" 文字
- `href`: 点击链接地址（null 表示不可点击）
- `style`: 自定义样式

### 6. 测试
1. 将你的 logo 图片放到指定位置
2. 更新 Logo 组件代码
3. 重启开发服务器
4. 检查所有页面的 logo 显示效果

## 当前状态
- ✅ Logo 组件已创建
- ✅ Layout 页面已更新
- ✅ Landing 页面已更新
- ⏳ 等待添加实际 logo 图片
