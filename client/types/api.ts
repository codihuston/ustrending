export interface RegionTrend {
  topic: string
  value: number
  geoCode: string
}

export interface Region {
  name: string
  trends: RegionTrend[]
}

export interface GoogleDailyTrend {
  title: {
    query: string
  }
  formattedTraffic: string
  image: GoogleTrendImage
  articles: GoogleTrendArticle[]
}

export interface GoogleTrendImage {
  newsUrl: string
  source: string
  imageUrl: string
}
export interface GoogleTrendArticle {
  title: string
  timeAgo: string
  source: string
  image: GoogleTrendImage
  url: string
  snippet: string
}

export interface Place {
  _id: string
  country: string
  countryCode: string
  createdAt: string
  geo: Point
  name: string
  parentId: number
  placeType: PlaceType
  region: string
  timezoneId: string
  updatedAt: Date
  url: string
  woeid: number
}

export interface PlaceType {
  code: number
  name: string
}

export interface Point {
  type: "Point"
  coordinates: [number, number]
}

export interface TwitterTrendMap {
  [id: string]: TwitterTrend[]
}

export interface TwitterTrend {
  name: string
  url: string
  promoted_content: string
  query: string
  tweet_volume: number
}