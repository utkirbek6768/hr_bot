//form
const test = {
  id: "145546",
  name: "Oddiy forma",
  fields: [
    {
      name: "name",
      title: "ismingizni kiriting",
      isRequired: true,
      type: Text,
    },
    {
      name: "address",
      title: "Manzilingizni kiritin",
      isRequired: true,
      type: Text,
    },
    {
      name: "stydy",
      title: "daraja",
      isRequired: true,
      aarr: ["oliy", "orta", "maktab", "uy"],
      type: photo,
    },
    {
      name: "photo",
      title: "Suratngizni kiriting",
      isRequired: true,
      type: photo,
    },
    {
      name: "yosh",
      title: "Suratngizni kiriting",
      isRequired: true,
      type: number,
    },
    {
      name: "jinsi",
      title: "Jinsingizni kiriting",
      isRequired: true,
      type: photo,
      errorMsg: "",
    },
    {
      name: "dasf",
      title: "hojirda nima ish qilasiz",
      isRequired: true,
      arr: ["uy bekasi", "vaqtincha ishsiz", "ishlayman"],
      type: arr,
    },
  ],

  id: "145546",
  name: "Oddiy forma",
  fields: [
    {
      name: "stydy",
      title: "daraja",
      isRequired: true,
      aarr: ["oliy", "orta", "maktab", "uy"],
      type: photo,
    },
    {
      name: "photo",
      title: "Suratngizni kiriting",
      isRequired: true,
      type: photo,
    },
    {
      name: "yosh",
      title: "Suratngizni kiriting",
      isRequired: true,
      type: number,
    },
    {
      name: "jinsi",
      title: "Jinsingizni kiriting",
      isRequired: true,
      type: photo,
      errorMsg: "",
    },
    {
      name: "dasf",
      title: "hojirda nima ish qilasiz",
      isRequired: true,
      arr: ["uy bekasi", "vaqtincha ishsiz", "ishlayman"],
      type: arr,
    },
  ],

  // id: 'sdfasd',
  // name: "Emter uchun forma",
  fields: [
    {
      name: "stydy",
      title: "daraja",
      isRequired: true,
      aarr: ["oliy", "orta", "maktab", "uy"],
      type: photo,
    },
    {
      name: "photo",
      title: "Suratngizni kiriting",
      isRequired: true,
      type: photo,
    },
    {
      name: "yosh",
      title: "Suratngizni kiriting",
      isRequired: true,
      type: number,
    },
    {
      name: "jinsi",
      title: "Jinsingizni kiriting",
      isRequired: true,
      type: photo,
      errorMsg: "yuqooridagilarni birinig tanlang",
    },
    {
      name: "bio",
      title: "oziz haqizda malumot kkirgizing",
      isRequired: true,
      aarr: ["oliy", "orta", "maktab", "uy"],
      type: photo,
    },
    {
      name: "dasf",
      title: "hojirda nima ish qilasiz",
      isRequired: true,
      arr: ["uy bekasi", "vaqtincha ishsiz", "ishlayman"],
      type: arr,
    },
  ],
};

// vacancy: {
// 	name: 'Royaltaxi',
// 	formId: '145546',
// }

// myForm.fileds.forEach((element) => {
//   if (element.step === user.step) {
//     element.type(type);
//     sendMessage(cahtId, "element.title");
//     myForm.fileds;
//   }
// });

if (msg.text && msg.text !== "/start" && res?.step == "name") {
  functions.updateQuestion(res._id, "step", "age", "firstName", msg.text);
  await bot.sendMessage(
    chatId,
    "Iltimos yoshingizni kiriting. Yosh cheklovi 15 dan 70 gacha masalan: 28"
  );
} else if (msg.text && res?.step && res?.step === "age") {
  try {
    const yoshRegex = /^(1[5-9]|[2-6]\d|70)$/;
    if (yoshRegex.test(msg.text)) {
      functions.updateQuestion(res._id, "step", "address", "age", msg.text);
      await bot.sendMessage(chatId, "Iltimos manzilingizni kiriting");
    } else {
      await bot.sendMessage(
        chatId,
        "Qabul qilinmadi yoshingizni raqamda kiriting"
      );
    }
  } catch (err) {
    console.log(err);
  }
} else if (msg.text && res?.step && res?.step === "address") {
  try {
    functions.updateQuestion(res._id, "step", "phone", "address", msg.text);
    await bot.sendMessage(chatId, "Iltimos telefon raqamingizni kiriting");
  } catch (err) {
    console.log(err);
  }
} else if (msg.text && res?.step && res?.step === "phone") {
  try {
    const telefonRegex = /\?+998|998(?:73|90|91|93|94|95|97|98|99)[1-9]\d{6}/;
    if (telefonRegex.test(msg.text) && res.for == "taxi") {
      functions.updateQuestion(
        res._id,
        "step",
        "academicDegree",
        "phone",
        msg.text
      );
      await bot.sendMessage(
        chatId,
        "Iltimos malumotingizni tanlagn",
        academicDegree
      );
    } else if (telefonRegex.test(msg.text) && res.for !== "taxi") {
      functions.updateQuestion(
        res._id,
        "step",
        "whereDidYouStudy",
        "phone",
        msg.text
      );
      await bot.sendMessage(
        chatId,
        "Qayerda o'qigansiz? O'zingiz tamomlagan o'quv dargohini nomini va qachon o'qishni tamomlaganingizni kiriting"
      );
    } else {
      await bot.sendMessage(
        chatId,
        `${msg.text} - Raqam qabul qilinmadi. Iltimos tekshirib qaytadan kiriting. Masalan: +998905376768`
      );
    }
  } catch (err) {
    console.log(err);
  }
} else if (msg.text && res?.step && res?.step === "whereDidYouStudy") {
  try {
    functions.updateQuestion(
      res._id,
      "step",
      "whereDidYouWork",
      "whereDidYouStudy",
      msg.text
    );
    await bot.sendMessage(
      chatId,
      "Birorjoyda ish tajribangiz bormi? Agar bo'lsa ishlagan joylaringiz haqida yozing."
    );
  } catch (err) {
    console.log(err);
  }
} else if (msg.text && res?.step && res?.step === "whereDidYouWork") {
  try {
    functions.updateQuestion(
      res._id,
      "step",
      "photo",
      "whereDidYouWork",
      msg.text
    );
    await bot.sendMessage(
      chatId,
      "Iltimos o'zingizni suratingizni yuklang va forma tugaydi"
    );
  } catch (error) {
    console.log(error);
  }
} else if (msg.text && VS[chatId]?.step === "title") {
  try {
    changeVacanciesStatusForAdmins(chatId, "step2", "title", msg.text);
    await bot.sendMessage(chatId, "Vakansiya test2 ni yozing");
  } catch (error) {
    console.log(error);
  }
} else if (msg.text && VS[chatId]?.step === "step2") {
  try {
    changeVacanciesStatusForAdmins(chatId, "step3", "test2", msg.text);
    await bot.sendMessage(chatId, "Vakansiya test3 ni yozing");
  } catch (error) {
    console.log(error);
  }
} else if (msg.text && VS[chatId]?.step === "step3") {
  try {
    changeVacanciesStatusForAdmins(chatId, "step4", "test3", msg.text);
    await bot.sendMessage(chatId, "Vakansiya test4 ni yozing");
  } catch (error) {
    console.log(error);
  }
} else if (msg.text && VS[chatId]?.step === "step4") {
  try {
    changeVacanciesStatusForAdmins(chatId, "description", "test4", msg.text);
    await bot.sendMessage(chatId, "Vakansiya uchun tavsif yozing");
  } catch (error) {
    console.log(error);
  }
} else if (msg.text && VS[chatId]?.step === "description") {
  try {
    changeVacanciesStatusForAdmins(chatId, "photo", "description", msg.text);
    console.log(VS[chatId]);
    await bot.sendMessage(
      chatId,
      "Vakansiyaga mos keladigan 'code' ni tanlang bu vacansiyalarni boshqarish uchun kerak",
      vacanciesCode
    );
  } catch (error) {
    console.log(error);
  }
} else {
  try {
    const isTextValid = markupsText.includes(msg.text);
    if (!isTextValid) {
      const step = res?.step;
      if (step === "photo") {
        await bot.deleteMessage(chatId, msg.message_id);
      } else if (VS[chatId]?.step == "photo") {
        console.log(VS[chatId]);
      } else {
        await bot.deleteMessage(chatId, msg.message_id);
        await bot.sendMessage(
          chatId,
          "Iltimos 'bot' ko'rsatmalariga asosan harakat qiling. Agar nosozlik vujudga kelsa /start tugmasini bosib 'bot'ga qaytadan start bering"
        );
      }
    }
  } catch (error) {
    console.error("Error handling invalid message:", error);
  }
}

//================================================================
const forms = [
  {
    name: "standart",
    filds: [
      {
        step: "age",
        msg: "Iltimos yoshingizni kiriting. yosh cheklovi 16 dan 50 yoshgacha masalan: 28",
        error:
          "Malumot qabul qilinmadi iltimos yoshingizni raqamlarda kiriting",
        type: "number",
        index: 2,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "document",
        msg: "Iltimos rezumeyingizni yuklang.",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring",
        type: "string",
        index: 8,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "address",
        msg: "Iltimos manzilingizni kiriting.",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring",
        type: "string",
        index: 3,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "photo",
        msg: "Iltimos o'zingizni suratingizni yuklang.",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring",
        type: "string",
        index: 7,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "fullName",
        msg: "Iltimos to'liq isim sharifingizni kiriting.",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring",
        type: "string",
        index: 1,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "acdemicDegree",
        msg: "Iltimos malumot darajangizni tanlang",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring",
        type: "string",
        index: 9,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "phone",
        msg: "Iltimos telefon raqamingizni kiriting. ushbu formatda +998XXXXXXXXX.",
        error:
          "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring. ushbu formatda +998XXXXXXXXX",
        type: "string",
        index: 4,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "gender",
        msg: "Iltimos jinsingizni tanlang.",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring.",
        type: "string",
        index: 10,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "whereDidYouStudy",
        msg: "Qayerda o'qigansiz o'zingiz tamomlagan o'quv dargohini nomini kiriting,agar hozirda o'qisangiz o'quv dargohi nomini qaysi bosqichda  o'qishingizni  kiriting.",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring.",
        type: "string",
        index: 5,
      },
    ],
  },
  {
    name: "standart",
    fields: [
      {
        step: "whereDidYouWork",
        msg: "Avval qayerda ishlagansiz? Qaysi kompariyada, qanday lavozimda, necha yil va qaysi yillarda ishlaganingiz haqida malumot bering (yoki: hechqayerda ish tajribam yo'q)",
        error: "Malumot qabul qilinmadi iltimos qaytadan urinib ko'ring.",
        type: "string",
        index: 6,
      },
    ],
  },
];

// forms.forEach(async (form) => {
// 	field = form.fields.shift();
// 	if (question && question?.step === field.step) {
// 	  await functions
// 		.updateQuestionItem(question._id, firstFalsyKey, msg.text)
// 		.then(async (response) => {
// 		  genericStep(response);
// 		  await functions
// 			.updateQuestionItem(question._id, "step", firstFalsyKey)
// 			.then(async (natija) => {
// 			  if (field.step === natija.step) {
// 				nextMsg = field.msg;
// 				await bot.sendMessage(chatId, nextMsg);
// 			  }
// 			});
// 		});
// 	}
//   });
