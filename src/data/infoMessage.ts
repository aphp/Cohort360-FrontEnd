import { WebContent } from 'services/aphp/callApi';

enum level {
  INFO = 'info',
  ERROR = 'error',
  WARNING = 'warning'
}

export const sortContent = (content: WebContent[]): WebContent[] => {
  return content.sort((a, b) => {
    try {
      const aOrder = a.metadata?.["order"]
      const bOrder = b.metadata?.["order"]

      // If either content doesn't have metadata or order, put it at the top
      if (!aOrder) return -1
      if (!bOrder) return 1

      return parseInt(aOrder) - parseInt(bOrder)
    } catch {
      // If parsing fails, treat as if content doesn't have metadata
      if (!a.metadata?.["order"]) return -1
      if (!b.metadata?.["order"]) return 1
      return 0
    }
  })
}

export const getBannerMessageLevel = (bannerMessage: WebContent): level => {
  if (bannerMessage.content_type === 'BANNER_WARNING') {
    return level.WARNING
  } else if (bannerMessage.content_type === 'BANNER_ERROR') {
    return level.ERROR
  } else {
    return level.INFO
  }
}
