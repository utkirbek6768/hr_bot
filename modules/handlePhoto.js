const fs = require("fs");
const https = require("https");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./scratch");
const botToken = process.env.BOT_TOKEN;
const functions = require("../functions/function.js");
const Questionnaire = require("../modelsSchema/questionnaire.schema.js");

const handlePhoto = async (bot, msg) => {
  try {
    const hrbot = path.dirname(__dirname);
    const src = path.join(path.dirname(__dirname), "photos");
    const chatId = msg.chat.id;
    const vacstep = localStorage.getItem("vacstep");
    const photoId = msg.photo[msg.photo.length - 1].file_id;
    // await bot.getFile(photoId).then((fileInfo) => console.log(fileInfo));
    // return;
    await Questionnaire.findOne({ chatId: chatId, status: "unfinished" })
      .sort({ createdAt: -1 })
      .limit(1)
      .then(async (res) => {
        if (res?.step == "photo") {
          bot.getFile(photoId).then((fileInfo) => {
            const file_type = fileInfo.file_path.split(".").pop();
            const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`;
            const directoryPath = path.join(hrbot, "photos");
            if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
            }
            const filename = fileInfo.file_unique_id.replace(/[^A-Za-z]/g, "");
            const filePath = path.join(
              directoryPath,
              `${filename}.${file_type}`
            );
            functions.updateQuestion(
              res._id,
              "step",
              "start",
              "photo",
              `${filename}.${file_type}`
            );
            const fileStream = fs.createWriteStream(filePath);

            https.get(fileUrl, (response) => {
              response.pipe(fileStream);
              fileStream.on("finish", async () => {
                try {
                  await bot.sendPhoto(chatId, filePath, {
                    caption:
                      `👤Sizning ma'lumotlaringiz.` +
                      "\n\n" +
                      `-Ismi: ${res.fullName}` +
                      "\n" +
                      `-Yoshi: ${res.age}` +
                      "\n" +
                      `-Manzili: ${res.address}` +
                      "\n" +
                      `-Tel: ${res.phone}` +
                      "\n" +
                      `-Qayerda o'qigani: ${res.whereDidYouStudy}` +
                      "\n" +
                      `-Qayerda ishlagani: ${res.whereDidYouWork}` +
                      "\n" +
                      `-Ariza holati: ${
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

              // Handle errors during the file download"photo"
              response.on("error", (error) => {
                console.error("Error downloading file:", error);
                fileStream.close();
              });
            });
          });
        } else if (vacstep == "photo") {
          await bot.getFile(photoId).then((fileInfo) => {
            const file_type = fileInfo.file_path.split(".").pop();
            const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`;
            const directoryPath = path.join(hrbot, "photos");
            if (!fs.existsSync(directoryPath)) {
              fs.mkdirSync(directoryPath, { recursive: true });
            }
            const filename = fileInfo.file_path.substring(
              fileInfo.file_path.indexOf("/") + 1
            );

            // const filename = fileInfo.file_unique_id.replace(/[^A-Za-z]/g, "");

            const filePath = path.join(directoryPath, filename);

            const fileStream = fs.createWriteStream(filePath);

            https.get(fileUrl, (response) => {
              response.pipe(fileStream);
              fileStream.on("finish", async () => {
                try {
                  functions.addToVacancies(bot, chatId, "image", filename);
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
          await bot.deleteMessage(chatId, msg.message_id);
        }
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handlePhoto,
};
