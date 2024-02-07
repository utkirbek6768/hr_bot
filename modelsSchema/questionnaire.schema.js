const mongoose = require("mongoose");

const QuestionnaireSchema = mongoose.Schema(
  {
    fullName: { type: String },
    age: { type: String },
    address: { type: String },
    whereDidYouStudy: { type: String },
    whereDidYouWork: { type: String },
    phone: { type: String },
    photo: { type: String },
    gender: { type: String },
    academicDegree: { type: String },
    studyOrWork: { type: String },
    documentPath: { type: String },
    document: { type: Boolean },
    step: { type: String },
    status: { type: String },
    for: { type: String },
    chatId: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Questionnaire", QuestionnaireSchema);
