import './styles/globals.scss'
import { Inter } from 'next/font/google'
import ThemeRegistry from './components/Global/Theme Registry/ThemeRegistry'
import { LeftDrawerProvider } from './context/LeftDrawerContext'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

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
        <LeftDrawerProvider>
          <ThemeRegistry options={{ key: 'mui-theme' }}>{children}</ThemeRegistry>
        </LeftDrawerProvider>
      </body>
    </html>
  )
}