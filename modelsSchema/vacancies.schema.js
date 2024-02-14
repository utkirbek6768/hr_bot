const mongoose = require("mongoose");

const VacanciesSchema = mongoose.Schema(
  {
    title: { type: String },
    office: { type: String },
    workingtime: { type: String },
    salary: { type: String },
    description: { type: String },
    code: { type: String },
    image: { type: String },
    active: { type: Boolean },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vacancies", VacanciesSchema);
