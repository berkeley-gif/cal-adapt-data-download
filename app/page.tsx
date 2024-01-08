import { promises as fs } from 'fs';

import styles from './page.module.scss'
import Image from 'next/image'
import logo from '../public/img/logos/cal-adapt-data-download.png'

import Dashboard from './components/Dashboard/Dashboard'

export default async function Home() {
  const filePackages = await fs.readFile(process.cwd() + '/app/data/packages.json', 'utf8')
  const packagesData = JSON.parse(filePackages)

  const fileCounties = await fs.readFile(process.cwd() + '/app/data/counties.json', 'utf8')
  const countiesData = JSON.parse(fileCounties)

  const fileModels = await fs.readFile(process.cwd() + '/app/data/models.json', 'utf8');
  const modelsData = JSON.parse(fileModels);

  return (
    <div className={styles.container}>
      <Dashboard packagesData={packagesData} countiesData={countiesData} modelsData={modelsData}/>
    </div>
  );
}