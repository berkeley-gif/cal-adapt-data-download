import './styles/globals.scss'
import { Inter } from 'next/font/google'
import ThemeRegistry from './components/Theme Registry/ThemeRegistry'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cal-Adapt Dashboard',
  description: '',
}

interface RootLayoutProps {
  children: React.ReactNode;
}


export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={inter.className}>
          <ThemeRegistry options={{ key: 'mui-theme' }}>{children}</ThemeRegistry>
      </body>
    </html>
  )
}