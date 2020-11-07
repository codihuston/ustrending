const GeoJSON = require("mongoose-geojson-schema");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const schema = new Schema(
  {
    datasetid: String,
    recordid: String,
    fields: {
      city: String,
      zip: String,
      dst: Number,
      geopoint: Array,
    },
    geometry: { type: Schema.Types.GeoJSON, alias: "geo" },
    record_stamp: Date,
  },
  { timestamps: true }
);

module.exports.Zipcode = mongoose.model("zipcode", schema);
