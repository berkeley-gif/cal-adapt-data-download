import styles from './page.module.scss'
import Switch from "@mui/material/Switch";
import Image from 'next/image'
import logo from '../public/img/logos/cal-adapt-data-download.png'

const label = { inputProps: { "aria-label": "Switch demo" } };

export default function Home() {
  return (
    <div className={styles.container}>
      <Image
        src={logo}
        alt={'Cal Adapt Data Download Logo'}
      />
      <div>
        <span>Coming soon...</span>
      </div>
    </div>
  );
}