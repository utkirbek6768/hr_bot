const fs = require("fs");
const https = require("https");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./scratch");
const botToken = process.env.BOT_TOKEN;
const functions = require("../functions/function.js");

const handleDocument = async (bot, msg) => {
  try {
    const chatId = msg.chat.id;
    const fileId = msg.document.file_id;
    const file_type = msg.document.file_name.split(".").pop();
    const file_name = msg.document.file_name.split(".").shift();
    bot
      .getFile(fileId)
      .then((fileInfo) => {
        const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileInfo.file_path}`;
        const directoryPath = "./documents";
        const filePath = path.join(directoryPath, `${file_name}.${file_type}`);
        if (!fs.existsSync(directoryPath)) {
          fs.mkdirSync(directoryPath, { recursive: true });
        }
        const writeStream = fs.createWriteStream(filePath);
        https.get(fileUrl, (response) => {
          response.pipe(writeStream);
          writeStream.on("finish", async () => {
            functions.addToQuestion(
              chatId,
              "documentPath",
              `${file_name}.${file_type}`
            );
            functions.addToQuestion(chatId, "document", true);
            await bot.sendMessage(
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
    console.error(error);
  }
};

module.exports = {
  handleDocument,
};
