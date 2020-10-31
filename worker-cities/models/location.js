const GeoJSON = require("mongoose-geojson-schema");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    population: Number, // String is shorthand for {type: String}
    censusPlaceId: Number,
    city: String,
    region: String,
    country: String,
    timezone_id: String,
    coordinates: { type: Schema.Types.GeoJSON },
    woeid: Number,
    yahooUri: String,
  },
  { timestamps: true }
);

module.exports.Location = mongoose.model("location", schema);
