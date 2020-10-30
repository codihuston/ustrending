// for rate limiting google trends api calls
module.exports.MAX_TREND_LIMIT = 5;
// for google trends api config
module.exports.GOOGLE_GEO_COUNTRY_CODE = "US";
module.exports.GOOGLE_HOST_LANGUAGE = "en-US";
module.exports.GOOGLE_TIME_ZONE = 300;
// for daily trends
module.exports.GOOGLE_GEO_TIME_RANGES = "now 7-d";
// crontab expression; minute 0 of every hour
module.exports.CRON_EXPRESSION_DAILY_TRENDS = "0 * * * *";
module.exports.CRON_EXPRESSION_REALTIME_TRENDS = "0 * * * *";
// IANA time zone identifier
module.exports.CRON_TIMEZONE = "America/Chicago";
// keys for redis
module.exports.REDIS_DAILY_TRENDS_KEY = "daily";
module.exports.REDIS_DAILY_TRENDS_BY_STATE_KEY = "daily-state";
module.exports.REDIS_REALTIME_TRENDS_BY_STATE_KEY = "realtime-state";
