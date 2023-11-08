import './globals.scss'
import { Inter } from 'next/font/google'
import ThemeRegistry from './components/ThemeRegistry/ThemeRegistry'
const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Cal Adapt - Data Download Tool',
  description: '',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeRegistry options={{ key: 'mui-theme' }}>{children}</ThemeRegistry>
      </body>
    </html>
  )
}