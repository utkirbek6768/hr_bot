const mongoose = require("mongoose");

const VacanciesSchema = mongoose.Schema(
  {
    title: { type: String },
    test2: { type: String },
    test3: { type: String },
    test4: { type: String },
    description: { type: String },
    image: { type: String },
    active: { type: Boolean },
    code: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vacancies", VacanciesSchema);
