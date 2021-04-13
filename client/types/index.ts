export interface RegionTrend {
  topic: string;
  value: number;
  geoCode: string;
}

export interface GoogleRegionTrend {
  name: string;
  trends: RegionTrend[];
}

export interface GoogleDailyTrend {
  title: {
    query: string;
  };
  formattedTraffic: string;
  image: GoogleTrendImage;
  articles: GoogleDailyTrendArticle[];
}

export interface GoogleTrendImage {
  newsUrl: string;
  source: string;
  imageUrl: string;
}
export interface GoogleDailyTrendArticle {
  title: string;
  timeAgo: string;
  source: string;
  image: GoogleTrendImage;
  url: string;
  snippet: string;
}

export interface GoogleRealtimeTrend {
  title: string;
  image: GoogleTrendImage;
  articles: GoogleRealtimeTrendArticle[];
}

export interface GoogleRealtimeTrendArticle {
  articleTitle: string;
  source: string;
  snippet: string;
  time: string;
  url: string;
}

export interface Place {
  _id: string;
  country: string;
  countryCode: string;
  createdAt: string;
  geo: Point;
  name: string;
  parentId: number;
  placeType: PlaceType;
  region: string;
  timezoneId: string;
  updatedAt: Date;
  url: string;
  woeid: number;
}

export interface PlaceType {
  code: number;
  name: string;
}

export interface Point {
  type: "Point";
  coordinates: [number, number];
}

export interface TwitterTrendsMap {
  [id: string]: TwitterTrendsList[];
}

export interface TwitterTrendsList {
  trends: TwitterTrend[];
  as_of: Date;
  created_at: string;
  locations: TwitterLocation[];
}

export interface TwitterTrend {
  name: string;
  url: string;
  promoted_content: string;
  query: string;
  tweet_volume: number;
}

export interface TwitterLocation {
  name: string;
  woeid: number;
}

export type SelectStringOptionType = { label: string; value: string };

export interface ZipCode {
  _id: string;
  Fields: {
    city: string;
    zip: string;
    dst: number;
    state: string;
    timezone: number;
  };
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
}

export function isGoogleDailyTrend(
  trend: GoogleDailyTrend | GoogleRealtimeTrend
): trend is GoogleDailyTrend {
  return (trend as GoogleDailyTrend)?.title?.query !== undefined;
}

export function isGoogleRealtimeTrend(
  trend: GoogleDailyTrend | GoogleRealtimeTrend
): trend is GoogleRealtimeTrend {
  return (
    (trend as GoogleRealtimeTrend)?.title !== undefined &&
    (trend as GoogleDailyTrend)?.title?.query === undefined
  );
}

export function isGoogleDailyTrendArticle(
  article: GoogleDailyTrendArticle | GoogleRealtimeTrendArticle
): article is GoogleDailyTrendArticle {
  return (article as GoogleDailyTrendArticle).title !== undefined;
}

export function isGoogleRealtimeTrendArticle(
  article: GoogleDailyTrendArticle | GoogleRealtimeTrendArticle
): article is GoogleRealtimeTrendArticle {
  return (article as GoogleRealtimeTrendArticle).articleTitle !== undefined;
}
