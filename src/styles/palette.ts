// Couleurs des chartes EDS et AP-HP, d'après la planche Couleurs_v2 du design system.
// Les rampes ne sont pas continues : la charte ne définit pas tous les échelons.

export const eds = {
  blue: {
    900: '#071B41',
    800: '#0D2F70',
    600: '#153D8A',
    400: '#2E5EBB',
    300: '#5C8AE3',
    200: '#9BBBF9',
    100: '#CFDFFF',
    50: '#EBF2FF'
  },
  fuchsia: {
    900: '#470224',
    800: '#7A033D',
    700: '#B10056',
    600: '#ED0677',
    500: '#F14298',
    300: '#F67EB8',
    200: '#FAB9D9',
    50: '#FEF5FA'
  }
} as const

export const aphp = {
  bleu: {
    900: '#041D3F',
    800: '#052C5F',
    700: '#0C4590',
    600: '#0063AF',
    500: '#3D88C2',
    300: '#7BAED5',
    200: '#B8D3E9',
    100: '#E0ECF7',
    75: '#ECF3F9',
    50: '#F5F9FC'
  },
  vert: {
    800: '#003819',
    700: '#004D24',
    600: '#00622E',
    500: '#007736',
    400: '#33AA69',
    300: '#66BF88',
    200: '#99D4B4',
    100: '#CCE8D7',
    50: '#E6F5EC',
    25: '#F2F9F5'
  },
  vertClair: {
    500: '#C3DCA5'
  },
  violet: {
    800: '#400A42',
    700: '#5C0F5E',
    600: '#781474',
    500: '#95198B',
    400: '#AB6DAB',
    300: '#C090BF',
    200: '#D4B3D4',
    100: '#E8D6E8',
    50: '#F5EDF5'
  },
  jaune: {
    900: '#7F5603',
    800: '#A37204',
    700: '#C78E05',
    600: '#EBAF06',
    500: '#FFCF00',
    400: '#FFE058',
    300: '#FEEA87',
    200: '#FFEEAD',
    100: '#FFF7D6',
    50: '#FFFBF0'
  },
  cyan: {
    900: '#002B2F',
    800: '#004B53',
    700: '#076D78',
    600: '#0D8592',
    500: '#009DA8',
    400: '#12C1CE',
    300: '#66DBE1',
    200: '#A1E5E9',
    100: '#C8F2F5',
    50: '#E4FCFD'
  },
  rose: {
    800: '#8F2A50',
    500: '#E25173',
    200: '#FFC1D7'
  },
  magenta: {
    900: '#490323',
    500: '#B90B63',
    200: '#FFC1DF'
  }
} as const

export const neutre = {
  900: '#1D1D1D',
  800: '#292929',
  700: '#414141',
  600: '#5B5B5B',
  500: '#727272',
  400: '#929292',
  300: '#B0B0B0',
  200: '#D0D0D0',
  100: '#E8E8E8',
  75: '#ECECEC',
  50: '#F9F9F9',
  0: '#FFFFFF'
} as const
