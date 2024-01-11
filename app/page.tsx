import { promises as fs } from 'fs';

import styles from './page.module.scss'

import Dashboard from './components/Dashboard/Dashboard'

async function getData() {
  const res = await fetch('https://r0e5qa3kxj.execute-api.us-west-2.amazonaws.com/collections/loca2-mon-county')
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.
 
  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error('Failed to fetch data')
  }
 
  return res.json()
}

export default async function Home() {
  const data = await getData()

  console.log(data)

  const filePackages = await fs.readFile(process.cwd() + '/app/data/packages.json', 'utf8')
  const packagesData = JSON.parse(filePackages)

  const fileCounties = await fs.readFile(process.cwd() + '/app/data/counties.json', 'utf8')
  const countiesData = JSON.parse(fileCounties)

  const fileModels = await fs.readFile(process.cwd() + '/app/data/models.json', 'utf8');
  const modelsData = JSON.parse(fileModels);

  return (
    <div className={styles.container}>
      <Dashboard data={data} packagesData={packagesData} countiesData={countiesData} modelsData={modelsData} />
    </div>
  );
}