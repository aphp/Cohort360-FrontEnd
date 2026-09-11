import { aphp, eds, neutre } from 'styles/palette'

export const onboardingTokens = {
  ink: neutre[800],
  titleInk: aphp.bleu[800],
  bodyInk: aphp.bleu[900],
  secondaryInk: '#37567F',
  pageBg: eds.blue[50],
  surface: '#FFFFFF',
  cardBorder: eds.blue[200],
  stepIconBg: '#FDDDBF',
  stepIconFg: aphp.jaune[900],
  avatarBg: '#5BC5F2',
  tileBg: aphp.vert[25],
  tileBorder: aphp.vert[100],
  rightBadgeBg: aphp.vertClair[500],
  rightBadgeFg: aphp.vert[600],
  warning: eds.fuchsia[600],
  documentBg: '#7F7F7F',
  primaryAction: eds.blue[300],
  primaryActionHover: eds.blue[400],
  secondaryActionBorder: '#69809F',
  commitmentCheck: eds.blue[300],
  consentBorder: aphp.bleu[200],
  menuBorder: eds.blue[50],
  tagInk: eds.blue[600],
  // Rail: the travelled part is the dark blue, what remains is the pale blue.
  railDone: eds.blue[400],
  railTodo: eds.blue[200],
  railInactiveFg: neutre[600]
} as const
