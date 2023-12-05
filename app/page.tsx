import styles from './page.module.scss'
import Image from 'next/image'
import logo from '../public/img/logos/cal-adapt-data-download.png'

import Dashboard from './components/Dashboard/Dashboard'

export default function Home() {
  return (
    <div className={styles.container}>
      <Dashboard />
    </div>
  );
}