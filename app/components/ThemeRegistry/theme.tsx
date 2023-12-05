// components/ThemeRegistry/theme.ts

import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });
import { createTheme } from '@mui/material/styles';

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
  },
  typography: {
    fontFamily: 'inherit',
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 600,
  },
  shape: {
    borderRadius: 16,
  },
});

export default theme;