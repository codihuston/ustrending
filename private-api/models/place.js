const GeoJSON = require("mongoose-geojson-schema");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    name: String,
    placeType: {
      code: Number,
      name: String,
    },
    url: String,
    parentid: Number,
    country: String,
    woeid: Number,
    countryCode: String,
    // custom fields
    geo: { type: Schema.Types.GeoJSON },
    region: String,
    regionFullName: String,
    timezone_id: String,
  },
  { timestamps: true }
);

module.exports.Place = mongoose.model("place", schema);
