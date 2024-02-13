const moment = require("moment");
const Condidates = require("../modelsSchema/condidates.schema.js");
const Questionnaire = require("../modelsSchema/questionnaire.schema.js");
const Form = require("../modelsSchema/form.schema.js");
const Vacancies = require("../modelsSchema/vacancies.schema.js");

const {
  empty,
  nextPage,
  reform,
  registerStart,
  gender,
  academicDegree,
  addQuestion,
  nextPageEnd,
  adminMarkup,
} = require("../myMarkups/markups");
const admins = [177482674]; // o'zim 2
let condidatCount = 0;
let currentPage = 0;
let perPage = 4;

const createCondidate = async (chatId, fullName) => {
  await Condidates.findOne({ chatId: chatId })
    .exec()
    .then(async (isset) => {
      if (!isset) {
        const condidates = new Condidates({
          fullName: fullName,
          admin: false,
          chatId: chatId,
          step: "start",
        });
        await condidates.save();
      }
    });
};
const createForm = async () => {
  try {
    const newForm = new Form({
      name: "standart",
      fields: [
        {
          step: "academicDegree",
          msg: "Iltimos malumotingizni tanlang.",
          error:
            "Malumot qabul qilinmadi iltimos yoshingizni raqamda kiriting.",
          type: "number",
          index: 10,
        },
      ],
    });

    const existingForms = await Form.find({
      "fields.step": "academicDegree",
    });

    if (existingForms && existingForms.length > 0) {
      await Form.deleteMany({ "fields.step": "academicDegree" });
    }

    await newForm.save();
  } catch (error) {
    console.error("Error creating form:", error);
  }
};

const createVacancies = async (bot, chatId, data) => {
  try {
    const createVacancies = new Vacancies({ ...data });
    //   const existingVacancies = await Vacancies.find({
    //     code: data.code,
    //   });

    //   if (existingVacancies && existingVacancies.length > 0) {
    //     await Vacancies.deleteMany({
    //       code: data.code,
    //     });
    //   }

    await createVacancies
      .save()
      .then(async (res) => {
        const resId = res._id.toString();
        const { title, test2, test3, test4, description, active, image } = res;
        const CommandVacancies = "CV";
        const options = {
          caption:
            "\n\n" +
            `${title}` +
            "\n\n" +
            `-${test2}` +
            "\n\n" +
            `-${test3}` +
            "\n\n" +
            `-${test4}` +
            "\n\n" +
            `-${description}`,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: active ? "Vaqtincha to'xtatish" : "Faollashtirish",
                  callback_data: JSON.stringify({
                    com: CommandVacancies,
                    ac: !active,
                    id: resId,
                  }),
                },
              ],
              [
                {
                  text: "O'chirish",
                  callback_data: JSON.stringify({
                    command: "deleteVacancies",
                    id: resId,
                  }),
                },
              ],
            ],
          }),
        };

        await bot.sendPhoto(chatId, image, options);
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

const updateVacancies = async (bot, chatId, id, item, value) => {
  try {
    await Vacancies.findOneAndUpdate(
      { _id: id },
      { $set: { [item]: value } },
      { new: true }
    )
      .exec()
      .then(async (res) => {
        const resId = res._id.toString();
        const { title, description, active, image } = res;
        const CommandVacancies = "CV";

        const options = {
          caption: `\n${title}\n\n${description}\n\n`,
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                {
                  text: active ? "Vaqtincha to'xtatish" : "Faollashtirish",
                  callback_data: JSON.stringify({
                    com: CommandVacancies,
                    ac: !active,
                    id: resId,
                  }),
                },
              ],
              [
                {
                  text: "O'chirish",
                  callback_data: JSON.stringify({
                    command: "deleteVacancies",
                    id: resId,
                  }),
                },
              ],
            ],
          }),
        };

        await bot.sendPhoto(chatId, image, options);
      });
  } catch (err) {
    console.log("bu error", err);
  }
};

// const createQuestion = async (chatId) => {
//   try {
//     const existingQuestionnaires = await Questionnaire.find({ chatId: chatId });
//     if (existingQuestionnaires.length === 1) {
//       return existingQuestionnaires[0];
//     } else if (existingQuestionnaires.length > 1) {
//       const lastQuestionnaire = existingQuestionnaires.pop();
//       await Questionnaire.deleteOne({ _id: lastQuestionnaire._id });
//     }
//     const questionnaire = new Questionnaire({
//       fullName: "",
//       age: "",
//       gender: "",
//       address: "",
//       academicDegree: "",
//       whereDidYouStudy: "",
//       whereDidYouWork: "",
//       studyOrWork: "",
//       phone: "",
//       photo: "",
//       documentPath: "",
//       document: false,
//       step: "start",
//       status: "unfinished",
//       for: "taxi",
//       chatId: chatId,
//     });
//     await questionnaire.save();
//     return questionnaire;
//   } catch (error) {
//     console.error("An error occurred:", error);
//     throw error;
//   }
// };

const createQuestion = async (chatId) => {
  try {
    await Questionnaire.deleteMany({ chatId: chatId, status: "unfinished" });
    const questionnaire = new Questionnaire({
      fullName: "",
      age: "",
      gender: "",
      address: "",
      academicDegree: "",
      whereDidYouStudy: "",
      whereDidYouWork: "",
      studyOrWork: "",
      phone: "",
      photo: "",
      documentPath: "",
      document: false,
      step: "start",
      status: "unfinished",
      for: "taxi",
      chatId: chatId,
    });
    await questionnaire.save();
    return questionnaire;
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

const updateCondidate = async (bot, collection, id, chatId, item, value) => {
  try {
    await collection
      .findOneAndUpdate({ _id: id }, { $set: { [item]: value } }, { new: true })
      .exec()
      .then(async (res) => {
        await bot.sendMessage(
          res.chatId,
          `👨🏻‍💻Arizangiz bo'yicha o'zgarish` +
            "\n\n" +
            `📄 Ariza holati: ${
              res.status === "cancellation"
                ? "Arizangiz bekorqilindi"
                : res.status === "interview"
                ? "Siz suxbatga chaqirildingiz"
                : res.status === "hiring"
                ? "Siz ishga qabul qilindingiz"
                : "Ko'rib chiqilishi kutilmoqda"
            }` +
            "\n" +
            `🕑Taxrirlangan vaqti: ${moment(res.updatedAt).format("DD.MM.YY")}`
        );
        await bot.sendMessage(
          chatId,
          `📄 Ariza holati: ${
            res.status === "cancellation"
              ? "Ariza bekorqilindi"
              : res.status === "interview"
              ? "Arizachi suxbatga chaqirildi"
              : res.status === "hiring"
              ? "Arizachi ishga qabul qilindi"
              : "Ko'rib chiqilishi kutilmoqda"
          } ga o'zgartirildi` +
            "\n\n" +
            `🕑 Taxrirlangan vaqti: ${moment(res.updatedAt).format("DD.MM.YY")}`
        );
      });
  } catch (err) {
    await bot.sendMessage(chatId, "Arizani o'chirib bo'lmadi.");
    console.log(err);
  }
};
const deleteData = async (bot, collection, dataId, chatId) => {
  await collection
    .findOneAndDelete({ _id: dataId })
    .then(async (res) => {
      if (res) {
        console.log(res);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const myQuestion = async (bot, chatId) => {
  try {
    const questionnaires = await Questionnaire.find({
      chatId: chatId,
      status: { $ne: "unfinished" },
    }).sort({ createdAt: -1 });

    if (questionnaires.length > 0) {
      for (const el of questionnaires) {
        try {
          if (el.photo && el.photo.length > 0) {
            msg = await bot.sendPhoto(chatId, el.photo, {
              caption:
                `Sizning ${
                  el.for == "teacher" ? "Oilaviy apteka" : "Enter o'quv markazi"
                } amaldagi arizangiz` +
                "\n\n" +
                `- Ismi: ${el?.fullName}` +
                "\n" +
                `- Yoshi: ${el.age}` +
                "\n" +
                `- Manzili: ${el.address}` +
                "\n" +
                `- Ish tajribasi: ${el.whereDidYouWork}` +
                "\n" +
                `- Qayerda o'qigani: ${el.whereDidYouStudy}` +
                "\n" +
                `- Tel: ${el.phone}` +
                "\n" +
                `- Ariza holati: ${
                  el.status === "cancellation"
                    ? "Arizangiz bekorqilindi"
                    : el.status === "interview"
                    ? "Siz suxbatga chaqirildingiz"
                    : el.status === "hiring"
                    ? "Siz ishga qabul qilindingiz"
                    : "Ko'rib chiqilishi kutilmoqda"
                }` +
                "\n" +
                `🕑Yaratilgan vaqti: ${moment(el.createdAt).format("DD.MM.YY")}
				  `,
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {
                      text: "O'chirish",
                      callback_data: JSON.stringify({
                        command: "delete",
                        value: el._id,
                      }),
                    },
                  ],
                ],
              }),
            });
          } else {
            // ${el.for == "taxi" ? "RoyalTaxi ga" : ""}
            msg = await bot.sendMessage(
              chatId,
              `Sizning amaldagi arizangiz` +
                "\n" +
                "\n" +
                `- Ismi: ${el.fullName}` +
                "\n" +
                `- Yoshi: ${el.age}` +
                "\n" +
                `- Manzili: ${el.address}` +
                "\n" +
                `- Malumoti: ${el.academicDegree}` +
                "\n" +
                `- Tel: ${el.phone}` +
                "\n" +
                `- Ariza holati: ${
                  el.status === "cancellation"
                    ? "Arizangiz bekorqilindi"
                    : el.status === "interview"
                    ? "Siz suxbatga chaqirildingiz"
                    : el.status === "hiring"
                    ? "Siz ishga qabul qilindingiz"
                    : "Ko'rib chiqilishi kutilmoqda"
                }` +
                "\n" +
                `🕑Yaratilgan vaqti: ${moment(el.createdAt).format(
                  "DD.MM.YY"
                )}`,
              {
                reply_markup: JSON.stringify({
                  inline_keyboard: [
                    [
                      {
                        text: "O'chirish",
                        callback_data: JSON.stringify({
                          command: "delete",
                          value: el._id,
                        }),
                      },
                    ],
                  ],
                }),
              }
            );
          }
        } catch (error) {
          console.error("Error sending message:", error);
        }
      }
    } else {
      await bot.sendMessage(
        chatId,
        "Hozirda sizda tugallangan arizalar yo'q.  Ariza qo'shish uchun 'Ariza_tofshirish' tugmasini bosing",
        addQuestion
      );
    }
  } catch (error) {
    console.error("Error fetching questionnaires:", error);
  }
};

const issetAge = async (bot, age, chatId) => {
  const yoshRegex = /^(1[5-9]|[2-6]\d|70)$/;
  if (yoshRegex.test(age)) {
    addToQuestion("age", age, false);
    await bot.sendMessage(chatId, "Iltimos manzilingizni kiriting");
  } else {
    await bot.sendMessage(
      chatId,
      "Qabul qilinmadi yoshingizni raqamda kiriting"
    );
  }
};
const addToQuestion = async (chatId, item, value) => {
  try {
    const question = await Questionnaire.updateMany(
      { chatId: chatId, step: "unfinished" },
      { $set: { [item]: value } }
    );
    return question;
  } catch (err) {
    console.log(err);
  }
};
const issetPhone = async (bot, phoneNumber, chatId, dataQuestion) => {
  const telefonRegex = /\?+998|998(?:73|90|91|93|94|95|97|98|99)[1-9]\d{6}/;
  if (telefonRegex.test(phoneNumber)) {
    await bot.sendMessage(
      chatId,
      `👤Sizning ma'lumotlaringiz.` +
        "\n" +
        `\n-Ismi: ${dataQuestion.fullName}` +
        "\n" +
        `` +
        "\n" +
        `-Yoshi: ${dataQuestion.age}` +
        "\n" +
        `-Manzili: ${dataQuestion.address}` +
        "\n" +
        `-Malumot darajasi: ${dataQuestion.academicDegree}` +
        "\n" +
        `-Tel: ${dataQuestion.phone}` +
        "\n" +
        `-Ariza holati: ${
          dataQuestion.status === "cancellation"
            ? "Arizangiz bekorqilindi"
            : dataQuestion.status === "interview"
            ? "Siz suxbatga chaqirildingiz"
            : dataQuestion.status === "hiring"
            ? "Siz ishga qabul qilindingiz"
            : "Ko'rib chiqilishi kutilmoqda"
        }
		  `,
      reform
    );
  } else {
    bot.sendMessage(
      chatId,
      `${phoneNumber} - Telefon raqami qabul qilinmadi iltimos tekshirib qaytadan kiriting masalan: +998905376768`
    );
  }
};
const sendingData = async (bot, collection, id, adminId) => {
  await collection.findOne({ _id: id }).then(async (res) => {
    await bot.sendMessage(
      adminId,
      `👨🏻‍💻Nomzod haqida malumotlar` +
        "\n\n" +
        `- Ismi: ${res.fullName}` +
        "\n" +
        `- Yoshi: ${res.age}` +
        "\n" +
        `- Manzili: ${res.address}` +
        "\n" +
        `- Malumoti: ${res.academicDegree}` +
        "\n" +
        `- Tel: ${res.phone}` +
        "\n" +
        `-Yaratilgan vaqti: ${moment(res.createdAt).format("DD.MM.YY")}` +
        "\n" +
        `- Ariza holati: ${
          res.status === "cancellation"
            ? "Arizangiz bekorqilindi"
            : res.status === "interview"
            ? "Siz suxbatga chaqirildingiz"
            : res.status === "hiring"
            ? "Siz ishga qabul qilindingiz"
            : "Ko'rib chiqilishi kutilmoqda"
        }
		  `,
      {
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: "Bekor qilindi",
                callback_data: JSON.stringify({
                  command: "cancellation",
                  value: res._id,
                }),
              },
              {
                text: "Suxbatga chaqirildi",
                callback_data: JSON.stringify({
                  command: "interview",
                  value: res._id,
                }),
              },
            ],
            [
              {
                text: "Ishga qaul qilindi",
                callback_data: JSON.stringify({
                  command: "hiring",
                  value: res._id,
                }),
              },
            ],
          ],
        }),
      }
    );
  });
};

const reason = async (bot, value, chatId) => {
  await bot.sendMessage(chatId, "Iltimos sababini tanlang", {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [
          {
            text: "Malumotlar yetarli emas",
            callback_data: JSON.stringify({
              command: "reason",
              value: value,
            }),
          },
          {
            text: "Suxbatga chaqirildi",
            callback_data: JSON.stringify({
              command: "reason",
              value: reason,
            }),
          },
        ],
        [
          {
            text: "Ishga qaul qilindi",
            callback_data: JSON.stringify({
              command: "reason",
              value: reason,
            }),
          },
        ],
      ],
    }),
  });
};
const sendingVacancies = async (bot, chatId, code) => {
  await Vacancies.find({ code: code, active: true }).then(async (result) => {
    try {
      if (result.length > 0) {
        result.forEach(async (res) => {
          const { title, test2, test3, test4, description, image } = res;
          await bot.sendPhoto(chatId, image, {
            caption:
              ` ${title}` +
              "\n\n" +
              `-${test2}` +
              "\n" +
              `-${test3}` +
              "\n" +
              `-${test4}` +
              "\n" +
              `-${description}`,
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Ariza qoldirish",
                    callback_data: JSON.stringify({
                      command: "registerstart",
                      value: code,
                    }),
                  },
                ],
              ],
            }),
          });
        });
      } else {
        await bot.sendMessage(
          chatId,
          "Ayni vaqitda ushbu vakansiya vaqtincha to'xtatilgan"
        );
      }
    } catch (error) {
      console.log("Error sending image:", error);
    }
  });
};

const sendingVacanciesAll = async (bot, chatId) => {
  try {
    const results = await Vacancies.find();
    const sendPhotoPromises = results.map(async (res) => {
      const resId = res._id.toString();
      const { title, test2, test3, test4, description, active, image } = res;
      const CommandVacancies = "CV";

      const options = {
        caption:
          `${title}` +
          "\n\n" +
          `-${test2}` +
          "\n" +
          `-${test3}` +
          "\n" +
          `-${test4}` +
          "\n" +
          `-${description}`,
        reply_markup: JSON.stringify({
          inline_keyboard: [
            [
              {
                text: active ? "Vaqtincha to'xtatish" : "Faollashtirish",
                callback_data: JSON.stringify({
                  com: CommandVacancies,
                  ac: !active,
                  id: resId,
                }),
              },
            ],
            [
              {
                text: "O'chirish",
                callback_data: JSON.stringify({
                  command: "deleteVacancies",
                  id: resId,
                }),
              },
            ],
          ],
        }),
      };

      await bot.sendPhoto(chatId, image, options);
    });

    await Promise.all(sendPhotoPromises);
  } catch (error) {
    console.log("Error sending images:", error);
  }
};

const vacanciesAll = async (bot, elementsPerPage, prevORnext, chatId) => {
  try {
    const currentPage = changePage(prevORnext);
    const totalCount = await Vacancies.countDocuments();
    const skipElements = currentPage * elementsPerPage;
    const response = await Vacancies.find()
      .skip(skipElements)
      .limit(elementsPerPage);

    if (condidatCount >= totalCount || currentPage <= 0) {
      condidatCount = elementsPerPage;
    } else {
      condidatCount += response.length;
    }

    if (response.length > 0) {
      let conIndex = 1;
      let conData = "";

      const elements = response.map((res) => {
        conData += `${conIndex} ). ${res.title}\n\n`;
        const element = {
          text: `${conIndex}`,
          callback_data: JSON.stringify({
            command: "sendOneVacan",
            value: `${res._id}`,
          }),
        };
        conIndex++;
        return element;
      });

      await bot.sendMessage(
        chatId,
        `${Math.min(
          skipElements + elementsPerPage,
          totalCount
        )}/${totalCount}\n\n${conData}`,
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              elements,
              skipElements + elementsPerPage < totalCount
                ? nextPage
                : skipElements + elementsPerPage === totalCount
                ? nextPageEnd
                : empty,
            ],
          }),
        }
      );
    } else {
      await bot.sendMessage(chatId, `Hozircha vakansiyalar mavjud emas`);
    }
  } catch (error) {
    console.log("This error message", error);
  }
};

const fetchAll = async (
  bot,
  collection,
  elementsPerPage,
  prevORnext,
  chatId,
  status
) => {
  try {
    const currentPage = changePage(prevORnext);
    const totalCount = await collection.countDocuments({ status: status });
    const skipElements = currentPage * elementsPerPage;
    const response = await collection
      .find({ status: status })
      .sort({ createdAt: -1 })
      .skip(skipElements)
      .limit(elementsPerPage);
    if (condidatCount >= totalCount || currentPage <= 0) {
      condidatCount = elementsPerPage;
    } else {
      condidatCount += response.length;
    }
    if (response.length > 0) {
      let conIndex = 1;
      let conData = "";
      const elements = response.map((el) => {
        if (el.document) {
          return {
            text: `${conIndex}`,
            callback_data: JSON.stringify({
              command: "prev",
              value: `${el._id}`,
            }),
          };
        } else {
          conData =
            conData +
            conIndex +
            " ). " +
            el.fullName +
            " | " +
            el.age +
            " | " +
            el.phone +
            " | " +
            el.academicDegree +
            "\n" +
            "\n";
          const element = {
            text: `${conIndex}`,
            callback_data: JSON.stringify({
              command: "sendOne",
              value: `${el._id}`,
            }),
          };
          conIndex++;
          return element;
        }
      });
      conIndex = 0;
      await bot.sendMessage(
        chatId,
        `${
          skipElements + perPage >= totalCount
            ? totalCount
            : skipElements + response.length
        }/${totalCount}` +
          "\n" +
          "\n" +
          `${conData}`,
        {
          reply_markup: JSON.stringify({
            inline_keyboard: [
              elements,
              skipElements + perPage < totalCount
                ? nextPage
                : skipElements + perPage === totalCount
                ? nextPageEnd
                : empty,
            ],
          }),
        }
      );
    } else {
      const statusMessage =
        status === "cancellation"
          ? "Bekorqilingan"
          : status === "interview"
          ? "Suxbatga chaqirilgan"
          : status === "hiring"
          ? "Ishga qabul qilingan"
          : "yangi";

      bot.sendMessage(chatId, `Hozircha ${statusMessage} arizalar mavjud emas`);
    }
  } catch (error) {
    console.log(error);
  }
};

const changePage = (prevORnext) => {
  if (prevORnext === "prev" && currentPage > 0) {
    currentPage -= 1;
    return currentPage;
  } else if (prevORnext == "next") {
    currentPage += 1;
    return currentPage;
  } else if (prevORnext == "all" || currentPage <= 0) {
    return 0;
  }
};

const sendToAdmins = async (bot, chatId, admins) => {
  try {
    const res = await Questionnaire.findOne({ chatId: chatId })
      .sort({ createdAt: -1 })
      .limit(1)
      .exec();

    if (res) {
      for (const adminId of admins) {
        if (res.for == "taxi") {
          await bot.sendMessage(
            adminId,
            `👨🏻‍💻Yangi ariza mavjud.` +
              "\n\n" +
              `- Ismi: ${res.fullName}` +
              "\n" +
              `- Yoshi: ${res.age}` +
              "\n" +
              `- Manzili: ${res.address}` +
              "\n" +
              `- Malumoti: ${res.academicDegree}` +
              "\n" +
              `- Tel: ${res.phone}` +
              "\n" +
              `- Yaratilgan vaqti: ${moment(res.createdAt).format(
                "DD.MM.YY"
              )}` +
              "\n" +
              `- Ariza holati: ${
                res.status === "cancellation"
                  ? "Arizangiz bekorqilindi"
                  : res.status === "interview"
                  ? "Siz suxbatga chaqirildingiz"
                  : res.status === "hiring"
                  ? "Siz ishga qabul qilindingiz"
                  : "Ko'rib chiqilishi kutilmoqda"
              }`,
            {
              reply_markup: JSON.stringify({
                inline_keyboard: [
                  [
                    {
                      text: "Bekor qilindi",
                      callback_data: JSON.stringify({
                        command: "cancellation",
                        value: res._id,
                      }),
                    },
                    {
                      text: "Suxbatga chaqirildi",
                      callback_data: JSON.stringify({
                        command: "interview",
                        value: res._id,
                      }),
                    },
                  ],
                  [
                    {
                      text: "Ishga qaul qilindi",
                      callback_data: JSON.stringify({
                        command: "hiring",
                        value: res._id,
                      }),
                    },
                  ],
                ],
              }),
            }
          );
        } else {
          const filePath = res.photo;
          await bot.sendPhoto(adminId, filePath, {
            caption: `👨🏻‍💻Yangi ariza mavjud.
  
			  -Ismi: ${res.fullName}
			  -Yoshi: ${res.age}
			  -Manzili: ${res.address}
			  -Malumot darajasi: ${res.academicDegree}
			  -Tel: ${res.phone}
			  -Qayerda o'qigani: ${res.whereDidYouStudy}
			  -Qayerda ishlagani: ${res.whereDidYouWork}
			  -Kompaniya: ${
          res.for == "pharmacy" ? "Oilaviy dorihonaga" : "Enter o'quv markaziga"
        }
			  -Ariza holati: ${
          res.status === "cancellation"
            ? "Arizangiz bekorqilindi"
            : res.status === "interview"
            ? "Siz suxbatga chaqirildingiz"
            : res.status === "hiring"
            ? "Siz ishga qabul qilindingiz"
            : "Ko'rib chiqilishi kutilmoqda"
        }`,
            reply_markup: JSON.stringify({
              inline_keyboard: [
                [
                  {
                    text: "Bekor qilindi",
                    callback_data: JSON.stringify({
                      command: "cancellation",
                      value: res._id,
                    }),
                  },
                  {
                    text: "Suxbatga chaqirildi",
                    callback_data: JSON.stringify({
                      command: "interview",
                      value: res._id,
                    }),
                  },
                ],
                [
                  {
                    text: "Ishga qaul qilindi",
                    callback_data: JSON.stringify({
                      command: "hiring",
                      value: res._id,
                    }),
                  },
                ],
              ],
            }),
          });
        }
      }
    }
  } catch (err) {
    console.log("Error in sendToAdmins:", err);
  }
};

const deleteMsgAll = async (bot, chatId, msgCount) => {
  const msgLimit = msgCount - 20;

  for (let i = msgCount; i >= msgLimit; i--) {
    try {
      await bot.deleteMessage(chatId, i);
    } catch (err) {
      console.log(err);
    }
  }
};

const fetchQuestion = async (chatId) => {
  try {
    const result = await Questionnaire.findOne({
      chatId: chatId,
      status: "unfinished",
    }).exec();
    return result;
  } catch (error) {
    console.error("Error fetching question:", error.message);
  }
};

const fetchForm = async () => {
  try {
    const results = await Form.find().exec();
    return results;
  } catch (error) {
    console.error("Error fetching forms:", error.message);
  }
};

const updateQuestion = async (id, item1, value1, item2, value2) => {
  const updateFields = { [item1]: value1, [item2]: value2 };
  try {
    const updatedDocument = await Questionnaire.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedDocument) {
      console.log("updateQuestion dan yangi error update amalga oshmadi");
    }

    const resultAfterUpdate = await Questionnaire.findById(id);

    if (
      resultAfterUpdate &&
      resultAfterUpdate[item1] === value1 &&
      resultAfterUpdate[item2] === value2
    ) {
      return resultAfterUpdate;
    } else {
      console.log("function updateQuestion: Update verification failed.");
    }
  } catch (err) {
    console.log("Update failed:", err);
  }
};

const exprement = async (bot, chatId, msg, question, form) => {
  if (question?.step === form.step) {
    await updateQuestion(question._id, "step", index, `${form.step}`, msg.text);
    await bot.sendMessage(chatId, form.msg);
    console.log(question);
  }
};

const updateQuestionItem = async (id, item, value) => {
  const updateFields = { [item]: value };
  try {
    const updatedDocument = await Questionnaire.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true }
    );
    if (!updatedDocument) {
      console.log("updateQuestion dan yangi error update amalga oshmadi");
    }
    const resultAfterUpdate = await Questionnaire.findById(id);
    if (resultAfterUpdate && resultAfterUpdate[item] === value) {
      return resultAfterUpdate;
    } else {
      console.log("function updateQuestionItem: Update verification failed.");
    }
  } catch (err) {
    console.log("Update failed:", err);
  }
};

const updateQuestionStep = async (id, item1, value1, item2, value2) => {
  const updateFields = { [item1]: value1, [item2]: value2 };
  try {
    const updatedDocument = await Questionnaire.findOneAndUpdate(
      { _id: id },
      { $set: updateFields },
      { new: true }
    );

    if (!updatedDocument) {
      console.log("updateQuestion dan yangi error update amalga oshmadi");
    }

    const resultAfterUpdate = await Questionnaire.findById(id);

    if (
      resultAfterUpdate &&
      resultAfterUpdate[item1] === value1 &&
      resultAfterUpdate[item2] === value2
    ) {
      return resultAfterUpdate;
    } else {
      console.log("Update verification failed.");
    }
  } catch (err) {
    console.log("Update failed:", err);
  }
};
// ssh uMidjon123A@167.99.243.112
module.exports = {
  updateQuestionStep,
  exprement,
  createCondidate,
  updateCondidate,
  deleteData,
  myQuestion,
  issetAge,
  addToQuestion,
  issetPhone,
  sendingData,
  fetchAll,
  changePage,
  createQuestion,
  sendToAdmins,
  createForm,
  createVacancies,
  sendingVacancies,
  sendingVacanciesAll,
  deleteMsgAll,
  reason,
  fetchQuestion,
  updateQuestion,
  vacanciesAll,
  updateVacancies,
  fetchForm,
  updateQuestionItem,
};
