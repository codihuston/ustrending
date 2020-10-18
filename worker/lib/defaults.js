module.exports.MAX_TREND_LIMIT = 0;
module.exports.GOOGLE_GEO_COUNTRY_CODE = "US";
module.exports.GOOGLE_HOST_LANGUAGE = "en-US";
module.exports.GOOGLE_TIME_ZONE = 300;
module.exports.GOOGLE_GEO_TIME_RANGES = "now 7-d";
module.exports.REDIS_DAILY_TRENDS_KEY = "daily";
// crontab expression; minute 0 of every hour
module.exports.CRON_EXPRESSION_DAILY_TRENDS = "0 * * * *";
module.exports.CRON_EXPRESSION_REALTIME_TRENDS = "0 * * * *";
// IANA time zone identifier
module.exports.CRON_TIMEZONE = "America/Chicago"