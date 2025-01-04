// components/ThemeRegistry/theme.ts
import { createTheme } from '@mui/material/styles';
import { IconButtonProps } from '@mui/material/IconButton'

const { palette } = createTheme();

// Define your custom variant type
type CustomIconButtonProps = IconButtonProps & {
  variant?: 'customVariant';
}

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
  components: {
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: 'none', // Remove the drop shadow
        },
      },
    },
    MuiAlert: {
      variants: [
        {
          props: { variant: 'purple' },
          style: {
            backgroundColor: '#C7C6F8', // Customize the background color
          },
        },
        {
          props: { variant: 'grey' },
          style: {
            backgroundColor: '#E5ECF6', // Customize the background color
          },
        }
      ],
      styleOverrides: {
        root: {
          borderRadius: 8,
          color: 'inherit',
          padding: '25px'
        },
        filledInfo: {
          backgroundColor: '#E3F5FF',
          color: 'inherit',
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          '&:before': {
            display: 'none',
          },
          borderBottom: '1px solid var(--black-10, rgba(28, 28, 28, 0.10))',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.variant === 'contained' &&
            ownerState.color === 'primary' && {
            backgroundColor: '#D3F1F8',
            color: '#333538',
            boxShadow: 'none',
            textTransform: 'capitalize',
            borderRadius: '8px'
          }),
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: '15px',
          borderRadius: '3px'
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0px 4px 4px 0px rgba(0, 0, 0, 0.25)',
          color: '#000000',
          borderRadius: '6px',
          maxWidth: 220,
          padding: '15px'
        }
      }
    }
  }
});

export default theme

