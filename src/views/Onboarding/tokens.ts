import { aphp, eds, neutre } from 'styles/palette'

export const onboardingTokens = {
  ink: neutre[800],
  muted: neutre[600],
  pageBg: eds.blue[50],
  surface: '#FFFFFF',
  cardBorder: eds.blue[200],
  stepIconBg: '#FDDDBF',
  stepIconFg: aphp.jaune[900],
  avatarBg: '#5BC5F2',
  tileBg: '#F5F8FE',
  warning: '#E5007D',
  deepBlue: '#0062AB',
  documentBg: '#7F7F7F',
  // Rail: the travelled part is the dark blue, what remains is the pale blue.
  railDone: eds.blue[400],
  railTodo: eds.blue[200],
  railInactiveFg: neutre[600]
} as const
