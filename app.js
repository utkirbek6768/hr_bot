const fs = require("fs");
const https = require("https");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./scratch");
const TelegramBot = require("node-telegram-bot-api");
const botToken = process.env.BOT_TOKEN;
const bot = new TelegramBot(botToken, { polling: true });
const mongoose = require("mongoose");
const express = require("express");
const functions = require("./myFunction/function.js");
const {
  registerStart,
  remove,
  reform,
  questionarieStatus,
  adminHome,
  academicDegree,
  addQuestion,
  vacancies,
  vacanciesHome,
  vacanciesCode,
} = require("./myMarkups/markups");

const Questionnaire = require("./modelsSchema/questionnaire.schema.js");
const Vacancies = require("./modelsSchema/vacancies.schema.js");
const Form = require("./modelsSchema/form.schema.js");
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI_WEB)
  .then(() => {
    console.log("DB connected!");
  })
  .catch((err) => {
    console.log("DB connection error:", err);
  });
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => {
//     console.log("DB connected!");
//   })
//   .catch(() => {
//     console.log("DB connection error: ");
//   });

// =============MY CONCTANTS=============
// const adminChatId = 6625548114; // hr manager
const adminChatId = 1259604390; // o'zim 2
// const adminChatId = 545050591; // Hikmatillo
// const adminChatId = 685051853; // Jaloldinaka
// const adminChatId = 177482674;
const admins = [177482674];
let perPage = 4;
const markupsText = [
  "/start",
  "Yangi_arizalar",
  "Bekor_qilingan",
  "Suxbatga_chaqirilgan",
  "Qabul_qilingan",
  "RoyalTaxi",
  "Apteka",
  "Enter",
  "Ariza_tofshirish",
  "Mening_arizalarim",
  "Vakansiyalar",
  "Arizalar",
  "Home",
  "Amaldagi_vakansiyalar",
  "Vakansiya_yaratish",
  "Qaytish",
];
//==============MY FUNCTION=================

// functions.createForm();
const QS = {};
const changeQuestionStatus = (chatId, step) => {
  if (QS[chatId]) {
    QS[chatId].step = step;
  } else {
    QS[chatId] = {
      step: step,
      perpage: 4,
    };
  }
};

const VS = {};
const changeVacanciesStatusForAdmins = (chatId, step, item, value) => {
  const defaultFormData = {
    title: "Invalid",
    test2: "Invalid",
    test3: "Invalid",
    test4: "Invalid",
    description: "Invalid",
    image: "Invalid",
    code: "Invalid",
    active: false,
  };

  if (VS[chatId]) {
    const { formData } = VS[chatId];
    formData[item] = value;
    VS[chatId].step = step;
  } else {
    VS[chatId] = {
      step,
      perpage: 4,
      formData: { ...defaultFormData },
    };
  }
};
let firstFalsyKey = null;

const genericStep = async (question) => {
  try {
    if (question) {
      const plainObject = question.toObject();
      for (const key in plainObject) {
        if (!plainObject[key]) {
          firstFalsyKey = key;
          break;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

// ======================Bot Event====================================

bot.setMyCommands([{ command: "/start", description: "Start" }]);

// ================ON MESSAGE================
bot.on("message", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const question = await functions.fetchQuestion(chatId);
    // localStorage.setItem("step", chatId);
    if (localStorage.getItem(chatId)) {
      bot.sendMessage(chatId, localStorage.getItem(chatId));
      localStorage.removeItem(chatId);
    }
    genericStep(question);
    let forms = await functions.fetchForm();
    let nextMsg = null;
    let field = null;
    forms.forEach(async (form) => {
      field = form.fields.shift();
      if (question && question?.step === field.step) {
        await functions
          .updateQuestionItem(question._id, firstFalsyKey, msg.text)
          .then(async (response) => {
            genericStep(response);
            await functions
              .updateQuestionItem(question._id, "step", firstFalsyKey)
              .then(async (natija) => {
                if (field.step === natija.step) {
                  nextMsg = field.msg;
                  await bot.sendMessage(chatId, nextMsg);
                }
              });
          });
      }
    });
  } catch (err) {
    console.log("Error processing message:", err);
  }
});

// ======================onText=========================

bot.onText(/\/start/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const fullName = msg.from.first_name;
    changeQuestionStatus(chatId, "pending");
    // await bot.deleteMessage(chatId, msg.message_id);
    functions.createCondidate(chatId, fullName);
    functions.createQuestion(chatId);

    await Questionnaire.findOne({ chatId: chatId, step: "finished" })
      .exec()
      .then(async (res) => {
        if (chatId == adminChatId) {
          changeVacanciesStatusForAdmins(chatId, "start");
          await bot.sendMessage(
            chatId,
            "Hushkelibsiz hurmatli admin ",
            adminHome
          );
        } else {
          if (res && res.step == "finished") {
            await bot.sendMessage(
              chatId,
              `Salom ${
                msg.from.first_name
              } Botga hushkelibsiz.Sizning amaldagi arizangizni holati ${
                res.status === "cancellation"
                  ? "Arizangiz bekorqilindi"
                  : res.status === "interview"
                  ? "Siz suxbatga chaqirildingiz"
                  : res.status === "hiring"
                  ? "Siz ishga qabul qilindingiz"
                  : "Ko'rib chiqilishi kutilmoqda"
              } `,
              addQuestion
            );
          } else {
            await bot.sendMessage(
              chatId,
              `Salom ${msg.from.first_name} Botga hushkelibsiz. Bu bot ROYALTAXI kompaniyasiga ishga kirishda nomzodlarni ro'yxatga olish uchun test tariqasida yaratildi `,
              addQuestion
            );
          }
        }
      })
      .catch((err) => console.log(err));
  } catch (error) {
    console.log(error);
  }
});

bot.onText(/Qaytish/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "qaytish", adminHome);
    await bot.deleteMessage(chatId, msg.message_id);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Vakansiyalar/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.deleteMessage(chatId, msg.message_id);
    await bot.sendMessage(chatId, "vakansiyalar", vacanciesHome);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Amaldagi_vakansiyalar/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "amaldagi vakansiyalar", vacanciesHome);
    await bot.deleteMessage(chatId, msg.message_id);
    await bot.deleteMessage(chatId, msg.message_id - 1);
    // functions.vacanciesAll(bot, 1, "all", chatId);
    functions.sendingVacanciesAll(bot, chatId);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Vakansiya_yaratish/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.deleteMessage(chatId, msg.message_id);
    await bot.sendMessage(chatId, "Vacansiya nomini kiriting", remove);
    changeVacanciesStatusForAdmins(chatId, "title");
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Arizalar/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, "arizalar", questionarieStatus);
    await bot.deleteMessage(chatId, msg.message_id);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Ariza_tofshirish/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await functions.createQuestion(chatId);
    await bot.deleteMessage(chatId, msg.message_id);
    await bot.sendMessage(
      chatId,
      "Iltimos o'zingizga moskeladigan soxani tanlang",
      vacancies
    );
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/RoyalTaxi/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const delId = msg.message_id;
    await bot.deleteMessage(chatId, delId - 1, remove);
    await bot.deleteMessage(chatId, delId);
    await functions.sendingVacancies(bot, chatId, "taxi");
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Apteka/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await functions
      .fetchQuestion(chatId)
      .then(async (res) => {
        // await bot.deleteMessage(chatId, msg.message_id);
        await functions.sendingVacancies(bot, chatId, "pharmacy");
        functions.updateQuestion(res._id, "step", "start", "for", "pharmacy");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Enter/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const delId = msg.message_id;
    await functions
      .fetchQuestion(chatId)
      .then(async (res) => {
        await bot.deleteMessage(chatId, delId - 1, remove);
        await bot.deleteMessage(chatId, delId, remove);
        await functions.sendingVacancies(bot, chatId, "teacher");
        functions.updateQuestion(res._id, "step", "start", "for", "teacher");
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/Mening_arizalarim/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.deleteMessage(chatId, msg.message_id);
    functions.myQuestion(bot, chatId);
  } catch (error) {
    console.error("An error occurred:", error);
  }
});

bot.onText(/\/Yangi_arizalar/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    await bot.deleteMessage(chatId, msg.message_id);
    changeQuestionStatus(chatId, "pending");
    functions.fetchAll(bot, Questionnaire, perPage, "all", chatId, "pending");
  } catch (error) {
    console.log(error);
  }
});

bot.onText(/\/Bekor_qilingan/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const delId = msg.message_id;
    changeQuestionStatus(chatId, "cancellation");
    await bot.deleteMessage(chatId, delId);
    functions.fetchAll(
      bot,
      Questionnaire,
      perPage,
      "all",
      chatId,
      "cancellation"
    );
  } catch (error) {
    console.log(error);
  }
});

bot.onText(/\/Suxbatga_chaqirilgan/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const delId = msg.message_id;
    changeQuestionStatus(chatId, "interview");
    await bot.deleteMessage(chatId, delId);
    functions.fetchAll(bot, Questionnaire, perPage, "all", chatId, "interview");
  } catch (err) {
    console.log(err);
  }
});

bot.onText(/\/Qabul_qilingan/, async (msg) => {
  try {
    const chatId = msg.chat.id;
    const delId = msg.message_id;
    changeQuestionStatus(chatId, "hiring");
    await bot.deleteMessage(chatId, delId);
    functions.fetchAll(bot, Questionnaire, perPage, "all", chatId, "hiring");
  } catch (err) {
    console.log(err);
  }
});

// // =======================colback=======================
bot.on("callback_query", async (msg) => {
  const data = JSON.parse(msg.data);
  const chatId = msg.message.chat.id;
  try {
    await functions
      .fetchQuestion(chatId)
      .then(async (res) => {
        if (data.command == "showVacancies") {
          await functions.sendingVacancies(bot, chatId, data.value);
        } else if (data.command === "registerstart") {
          try {
            const question = await functions.fetchQuestion(chatId);
            if (question) {
              await bot.deleteMessage(chatId, msg.message.message_id);

              await bot.sendMessage(
                chatId,
                "Iltimos ismingizni kiriting",
                remove
              );
              firstFalsyKey = "fullName";
              await functions
                .updateQuestion(
                  question._id,
                  "step",
                  "fullName",
                  "status",
                  "unfinished"
                )
                .then((re) => {
                  console.log(re, firstFalsyKey);
                });
            } else {
              console.error("No unfinished question found for chatId:", chatId);
            }
          } catch (err) {
            console.error("An error occurred:", err);
          }
        } else if (data.command == "document") {
          await bot.sendMessage(chatId, "Iltimos Resume yuklang");
        } else if (data.command == "vacancies") {
          //   await bot.deleteMessage(chatId, msg.message.message_id);
          // await bot.sendMessage(
          //   chatId,
          //   "Iltimos o'zingizga mos soxani tanlang",
          //   vacanciesIn
          // );
          await functions.sendingVacanciesAll(bot, chatId);
        } else if (data.command == "men" || data == "women") {
          functions.updateQuestion(
            res._id,
            "step",
            "address",
            "gender",
            data.value
          );
          bot.sendMessage(chatId, "Iltimos manzilingizni kiriting");
        } else if (data.command == "medium" || data.command == "higher") {
          //   await bot.deleteMessage(chatId, msg.message.message_id);
          functions.updateQuestion(
            res._id,
            "step",
            "unfinished",
            "academicDegree",
            data.value
          );
          await bot.sendMessage(
            chatId,
            `👤Sizning ma'lumotlaringiz.
			
			-Ismi: ${res.fullName}
			-Yoshi: ${res.age}
			-Manzili: ${res.address}
			-Malumot darajasi: ${data.value}
			-Tel: ${res.phone}
			-Ariza holati: ${
        res.status === "cancellation"
          ? "Arizangiz bekorqilindi"
          : res.status === "interview"
          ? "Siz suxbatga chaqirildingiz"
          : res.status === "hiring"
          ? "Siz ishga qabul qilindingiz"
          : "Ko'rib chiqilishi kutilmoqda"
      }
				`,
            reform
          );
        } else if (data.command == "reform") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          await bot.sendMessage(chatId, "Iltimos ismingizni kiriting");
          await functions.updateQuestion(
            res?._id,
            "step",
            "name",
            "status",
            "unfinished"
          );
        } else if (data.command == "save") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          await functions.updateQuestion(
            res?._id,
            "step",
            "finished",
            "status",
            "pending"
          );
          await bot.sendMessage(
            chatId,
            "Malumotlar muvofaqiyatli saqlandi tez orada sizbilan bog'lanamiz",
            addQuestion
          );
        } else if (data.command == "prev") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          await functions.fetchAll(
            bot,
            Questionnaire,
            perPage,
            "prev",
            chatId,
            QS[chatId].step
          );
        } else if (data.command == "next") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          functions.fetchAll(
            bot,
            Questionnaire,
            perPage,
            "next",
            chatId,
            QS[chatId].step
          );
        } else if (data.command == "all") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          functions.fetchAll(
            bot,
            Questionnaire,
            perPage,
            "all",
            chatId,
            QS[chatId].step
          );
        } else if (data.command === "delete") {
          try {
            await bot.deleteMessage(chatId, msg.message.message_id);
            const deletedQuestionnaire = await Questionnaire.findOneAndDelete({
              _id: data.value,
            });
            if (deletedQuestionnaire) {
              await bot.sendMessage(
                chatId,
                "Arizangiz muvofaqqiyatli o'chirildi"
              );
            } else {
              await bot.sendMessage(
                chatId,
                "Arizani topib bo'lmadi yoki o'chirib bo'lmadi"
              );
            }
          } catch (error) {
            console.error("Error deleting questionnaire:", error);
            await bot.sendMessage(
              chatId,
              "Xatolik yuz berdi. Arizani o'chirishda muammo ro'y berdi."
            );
          }
        } else if (data.command == "sendOne") {
          functions.sendingData(bot, Questionnaire, data.value, chatId);
        } else if (data.command == "cancellation") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          functions.updateCondidate(
            bot,
            Questionnaire,
            data.value,
            chatId,
            "status",
            data.command
          );
        } else if (data.command == "interview") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          functions.updateCondidate(
            bot,
            Questionnaire,
            data.value,
            chatId,
            "status",
            data.command
          );
        } else if (data.command == "hiring") {
          //   await bot.deleteMessage(chatId, msg.message.message_id);
          functions.updateCondidate(
            bot,
            Questionnaire,
            data.value,
            chatId,
            "status",
            data.command
          );
        } else if (data.com == "CV") {
          await bot.deleteMessage(chatId, msg.message.message_id);
          functions.updateVacancies(bot, chatId, data.id, "active", data.ac);
        } else if (data.command == "vacanCode") {
          try {
            await bot.deleteMessage(chatId, msg.message.message_id);
            changeVacanciesStatusForAdmins(chatId, "photo", "code", data.value);
            console.log(VS[chatId]);
            await bot.sendMessage(
              chatId,
              "Vakansiyaga mos keladigan rasim yuklang. Rasim kengaytmasi 'jpg' ekanligiga etibor berig!"
            );
          } catch (error) {
            console.log(error);
          }
        } else if (data.command == "newVacancies") {
          try {
            await bot.deleteMessage(chatId, msg.message.message_id);
            if (data.value == "save") {
              changeVacanciesStatusForAdmins(
                chatId,
                "finished",
                "active",
                true
              );
              functions.createVacancies(bot, chatId, VS[chatId].formData);
              await bot.sendMessage(
                chatId,
                "Vakansiyaga muvafaqqiyatli yaratildi",
                adminHome
              );
            } else {
              await bot.sendMessage(
                chatId,
                "Vakansiyaga bekor qilindi",
                adminHome
              );
            }
          } catch (error) {
            console.log(error);
          }
        } else if (data.command === "deleteVacancies") {
          try {
            await bot.deleteMessage(chatId, msg.message.message_id);
            const deletedQuestionnaire = await Vacancies.findOneAndDelete({
              _id: data.id,
            });
            if (deletedQuestionnaire) {
              await bot.sendMessage(
                chatId,
                "Vakansiya muvofaqqiyatli o'chirildi"
              );
            } else {
              await bot.sendMessage(
                chatId,
                "Vacansiyani topib bo'lmadi yoki o'chirib bo'lmadi"
              );
            }
          } catch (error) {
            console.error("Error deleting questionnaire:", error);
            await bot.sendMessage(
              chatId,
              "Vakansiyani o'chirishda muammo ro'y berdi."
            );
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
});

// // ====================photo=====================================

bot.on("photo", async (msg) => {
  try {
    const chatId = msg.chat.id;
    const photoId = msg.photo[msg.photo.length - 1].file_id;

    await Questionnaire.findOne({ chatId: chatId, status: "unfinished" })
      .sort({ createdAt: -1 })
      .limit(1)
      .then((res) => {
        if (res?.step == "photo") {
          bot.getFile(photoId).then((fileInfo) => {
            const file_type = fileInfo.file_path.split(".").pop();
            const fileUrl = `https://api.telegram.org/file/bot${TelegramBotToken}/${fileInfo.file_path}`;
            const directoryPath = path.join(__dirname, "photos");
            if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
            }
            const filePath = path.join(
              directoryPath,
              `${fileInfo.file_unique_id}.${file_type}`
            );
            functions.updateQuestion(
              res._id,
              "step",
              "start",
              "photo",
              filePath
            );
            const fileStream = fs.createWriteStream(filePath);

            https.get(fileUrl, (response) => {
              response.pipe(fileStream);
              fileStream.on("finish", async () => {
                try {
                  await bot.sendPhoto(chatId, filePath, {
                    caption: `👤Sizning ma'lumotlaringiz.
						  
			-Ismi: ${res.fullName}
			-Yoshi: ${res.age}
			-Manzili: ${res.address}
			-Tel: ${res.phone}
			-Qayerda o'qigani: ${res.whereDidYouStudy}
			-Qayerda ishlagani: ${res.whereDidYouWork}
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
                            text: "Saqlash",
                            callback_data: JSON.stringify({
                              command: "save",
                              value: "Saqlash",
                            }),
                          },
                          {
                            text: "Taxrirlash",
                            callback_data: JSON.stringify({
                              command: "reform",
                              value: "Taxrirlash",
                            }),
                          },
                        ],
                      ],
                    }),
                  });
                } catch (error) {
                  console.error("Error during bot operations:", error);
                } finally {
                  // Close the file stream
                  fileStream.close();
                }
              });

              // Handle errors during the file download
              response.on("error", (error) => {
                console.error("Error downloading file:", error);
                fileStream.close();
              });
            });
          });
        } else if (VS[chatId] && VS[chatId].step == "photo") {
          bot.getFile(photoId).then((fileInfo) => {
            const file_type = fileInfo.file_path.split(".").pop();
            const fileUrl = `https://api.telegram.org/file/bot${TelegramBotToken}/${fileInfo.file_path}`;
            const directoryPath = path.join(__dirname, "photos");
            if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
            }
            const filePath = path.join(
              directoryPath,
              `${fileInfo.file_unique_id}.${file_type}`
            );

            changeVacanciesStatusForAdmins(chatId, "photo", "image", filePath);
            const fileStream = fs.createWriteStream(filePath);

            https.get(fileUrl, (response) => {
              response.pipe(fileStream);
              fileStream.on("finish", async () => {
                try {
                  await bot.sendPhoto(chatId, filePath, {
                    caption:
                      " \n\n" +
                      `💰${VS[chatId].formData.title}` +
                      "\n\n" +
                      `✍️${VS[chatId].formData.test2}` +
                      "\n\n" +
                      `🌐${VS[chatId].formData.test3}` +
                      "\n\n" +
                      `🌐${VS[chatId].formData.test4}` +
                      "\n\n" +
                      `📚${VS[chatId].formData.description}`,
                    reply_markup: JSON.stringify({
                      inline_keyboard: [
                        [
                          {
                            text: "Saqlash",
                            callback_data: JSON.stringify({
                              command: "newVacancies",
                              value: "save",
                            }),
                          },
                          {
                            text: "Bekor qilish",
                            callback_data: JSON.stringify({
                              command: "newVacancies",
                              value: "cancellation",
                            }),
                          },
                        ],
                      ],
                    }),
                  });
                } catch (error) {
                  console.error("Error during bot operations:", error);
                } finally {
                  // Close the file stream
                  fileStream.close();
                }
              });

              // Handle errors during the file download
              response.on("error", (error) => {
                console.error("Error downloading file:", error);
                fileStream.close();
              });
            });
          });
        } else {
          bot.deleteMessage(chatId, msg.message_id);
        }
      });
  } catch (error) {
    console.log(error);
  }
});

// ======================document==================================
bot.on("document", (msg) => {
  try {
    const chatId = msg.chat.id;
    const fileId = msg.document.file_id;
    const file_type = msg.document.file_name.split(".").pop();
    const file_name = msg.document.file_name.split(".").shift();
    bot
      .getFile(fileId)
      .then((fileInfo) => {
        const fileUrl = `https://api.telegram.org/file/bot${TelegramBotToken}/${fileInfo.file_path}`;
        const directoryPath = "./documents";
        const filePath = path.join(directoryPath, `${file_name}.${file_type}`);
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }
        const writeStream = fs.createWriteStream(filePath);
        https.get(fileUrl, (response) => {
          response.pipe(writeStream);
          writeStream.on("finish", () => {
            functions.addToQuestion(
              chatId,
              "documentPath",
              `${file_name}.${file_type}`
            );
            functions.addToQuestion(chatId, "document", true);
            bot.sendMessage(
              chatId,
              `Fayil muvofaqqiyatli saqlandi tez orada siz bila bog'lanamiz.`
            );
          });
        });
      })
      .catch((error) => {
        bot.sendMessage(chatId, "Error downloading document.");
      });
  } catch (error) {
    console.log(error);
  }
});

// Xatolarni qayta ishlash va qayta urinish mexanizmiga misol
bot.on("polling_error", (error) => {
  try {
    console.error(`Polling error: ${error.message}`);
    // Qayta urinish mantiqini shu yerda amalga oshiring
    setTimeout(() => {
      bot.startPolling();
    }, 5000); // 5 soniyadan keyin qayta urinib ko'ring
  } catch (error) {
    console.log(error);
  }
});

module.exports = app;
