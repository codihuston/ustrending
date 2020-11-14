const GeoJSON = require("mongoose-geojson-schema");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    _id: Schema.Types.ObjectId,
    population: Number, // String is shorthand for {type: String}
    censusPlaceId: Number,
    censusStateId: Number,
    city: String,
    region: String,
    regionFullName: String,
    country: String,
    timezone_id: String,
    coordinates: { type: Schema.Types.GeoJSON },
    woeid: Number,
    yahooUri: String,
  },
  { timestamps: true }
);

module.exports.Location = mongoose.model("location", schema);
