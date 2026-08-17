import { aphp, eds, neutre } from 'styles/palette'

export const onboardingTokens = {
  ink: neutre[800],
  muted: neutre[600],
  titleInk: aphp.bleu[800],
  bodyInk: aphp.bleu[900],
  pageBg: eds.blue[50],
  surface: '#FFFFFF',
  cardBorder: eds.blue[200],
  stepIconBg: '#FDDDBF',
  stepIconFg: aphp.jaune[900],
  avatarBg: '#5BC5F2',
  tileBg: '#F5F8FE',
  warning: eds.fuchsia[600],
  deepBlue: '#0062AB',
  documentBg: '#7F7F7F',
  primaryAction: eds.blue[300],
  primaryActionHover: eds.blue[400],
  secondaryActionBorder: '#69809F',
  commitmentCheck: eds.blue[300],
  // Rail: the travelled part is the dark blue, what remains is the pale blue.
  railDone: eds.blue[400],
  railTodo: eds.blue[200],
  railInactiveFg: neutre[600]
} as const
