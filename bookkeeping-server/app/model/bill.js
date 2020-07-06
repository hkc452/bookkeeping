'use strict';
module.exports = app => {
  const mongoose = app.mongoose;
  const Schema = mongoose.Schema;
  const BillSchema = new Schema({
    category: { type: String },
    amount: { type: Number },
    type: { type: Number },
    time: { type: String },
  }, { collection: 'bill', versionKey: false });

  return mongoose.model('bill', BillSchema);
};
