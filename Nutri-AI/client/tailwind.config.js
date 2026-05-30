export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#A8E063',
        'brand-dark': '#7BC142',
        background: '#0B0F0A',
        card: '#111510',
        'card-hover': '#161B14',
        'text-primary': '#F0F4EE',
        'text-secondary': '#8A9E85',
        'text-muted': '#4A5E45',
        'border-subtle': 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
