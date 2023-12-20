import { promises as fs } from 'fs';

import styles from './page.module.scss'
import Image from 'next/image'
import logo from '../public/img/logos/cal-adapt-data-download.png'

import Dashboard from './components/Dashboard/Dashboard'

export default async function Home() {
  const file = await fs.readFile(process.cwd() + '/app/data/packages.json', 'utf8');
  const packagesData = JSON.parse(file);

  const fileCounties = await fs.readFile(process.cwd() + '/app/data/counties.json', 'utf8');
  const countiesData = JSON.parse(fileCounties);

  return (
    <div className={styles.container}>
      <Dashboard packagesData={packagesData} countiesData={countiesData} />
    </div>
  );
}