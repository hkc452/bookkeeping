'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;

  const CategoriesSchema = new Schema({
    name: { type: String },
    _id: { type: String },
    type: { type: Number },
  }, { versionKey: false });

  return mongoose.model('categories', CategoriesSchema);
};
