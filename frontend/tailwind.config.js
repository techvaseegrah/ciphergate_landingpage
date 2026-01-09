/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#0d9488', // Changed to teal as requested
        'primary-hover': '#0f766e', // Darker teal for hover
        secondary: '#2196F3',
        danger: '#f44336',
        success: '#4CAF50',
        warning: '#FFC107',
        info: '#2196F3',
        light: '#f4f4f4',
        dark: '#333',
        // Custom theme colors
        'theme-red': '#0d9488',
        'theme-white': '#FFFFFF',
        'theme-black': '#000000',
        // Landing page colors
        'primary-green': '#26D07C', 
        'primary-hover-green': '#1eb36a',
        'soft-green': '#E9F9F1',
        'dark-navy': '#1A2B3C',
        'gray-text': '#67748E',
        'light-gray': '#F8FAFC',
        // New refined color system
        'gray-50': '#f9fafb',
        'gray-100': '#f3f4f6',
        'gray-200': '#e5e7eb',
        'gray-300': '#d1d5db',
        'gray-400': '#9ca3af',
        'gray-500': '#6b7280',
        'gray-600': '#4b5563',
        'gray-700': '#374151',
        'gray-800': '#1f2937',
        'gray-900': '#111827',
        'slate-50': '#f8fafc',
        'slate-100': '#f1f5f9',
        'slate-200': '#e2e8f0',
        'slate-300': '#cbd5e1',
        'slate-400': '#94a3b8',
        'slate-500': '#64748b',
        'slate-600': '#475569',
        'slate-700': '#334155',
        'slate-800': '#1e293b',
        'slate-900': '#0f172a',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
        'poppins': ['Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        'float': '0 20px 40px -15px rgba(38, 208, 124, 0.15)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        rise: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        buildRotate: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '50%': { transform: 'rotate(10deg)' },
        },
        moveUp: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        moveDown: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(10px)' },
        },
        workflowStretch: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.05)' },
        }
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        rise: 'rise 6s ease-in-out infinite',
        'build-rotate': 'buildRotate 6s ease-in-out infinite',
        'move-up': 'moveUp 6s ease-in-out infinite',
        'move-down': 'moveDown 6s ease-in-out infinite',
        'workflow-stretch': 'workflowStretch 6s ease-in-out infinite',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}