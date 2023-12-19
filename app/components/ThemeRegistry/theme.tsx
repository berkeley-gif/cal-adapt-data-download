// components/ThemeRegistry/theme.ts

import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { createTheme } from '@mui/material/styles';

const { palette } = createTheme();

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#E3F5FF',
      contrastText: '#333538',
    },
    secondary: {
      main: '#000000',
    },
    success: {
      main: '#76cba9',
    },
    info: {
      main: '#C6C7F8',
    },
    greybg: {
      main: "#F7F9FB"
    }
  },
  typography: {
    fontFamily: 'inherit',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontWeight: 600,
      fontSize: '6rem'
    },
    h2: {
      fontWeight: 500,
      fontSize: '4.063rem'
    },
    h3: {
      fontWeight: 400,
      fontSize: '2.5rem'
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.563rem'
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.125rem'
    },
    h6: {
      fontWeight: 700,
      fontSize: '1rem',
      color: '#373C47'
    },
    body2: {
      color: "#6F6F6F"
    }
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;