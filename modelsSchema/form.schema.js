const mongoose = require("mongoose");

const FormSchema = mongoose.Schema({
  name: { type: String },
  fields: [
    {
      step: { type: String },
      msg: { type: String },
      error: { type: String },
      type: { type: String },
      index: { type: Number },
    },
  ],
});

module.exports = mongoose.model("Form", FormSchema);
