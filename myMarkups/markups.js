const remove = {
  reply_markup: {
    remove_keyboard: true,
  },
};
const adminHome = {
  reply_markup: {
    keyboard: [[{ text: "Vakansiyalar" }], [{ text: "Arizalar" }]],
  },
};

const vacanciesHome = {
  reply_markup: {
    keyboard: [
      [{ text: "Amaldagi_vakansiyalar" }],
      [{ text: "Vakansiya_yaratish" }],
      [{ text: "Qaytish" }],
    ],
  },
};

const questionarieStatus = {
  reply_markup: {
    keyboard: [
      [{ text: "/Yangi_arizalar" }, { text: "/Bekor_qilingan" }],
      [{ text: "/Suxbatga_chaqirilgan" }, { text: "/Qabul_qilingan" }],
      [{ text: "Qaytish" }],
    ],
  },
};

const vacancies = {
  reply_markup: {
    keyboard: [
      [{ text: "RoyalTaxi" }],
      [{ text: "Apteka" }],
      [{ text: "Enter" }],
    ],
  },
};
const addQuestion = {
  reply_markup: JSON.stringify({
    keyboard: [[{ text: "Ariza_tofshirish" }], [{ text: "Mening_arizalarim" }]],
  }),
};

// ----------------------------------------------
const nextVacancies = [
  {
    text: "⏮",
    callback_data: JSON.stringify({
      command: "prevVacan",
      value: "Avval",
    }),
  },
  {
    text: "⏭",
    callback_data: JSON.stringify({
      command: "nextVacan",
      value: "Keyin",
    }),
  },
];
const nextVacanciesEnd = [
  {
    text: "⏮",
    callback_data: JSON.stringify({
      command: "nextVacanciesEnd",
      value: "Avvalgi",
    }),
  },
];

const nextPage = [
  {
    text: "⏮",
    callback_data: JSON.stringify({
      command: "prev",
      value: "Avvalgi",
    }),
  },
  {
    text: "⏭",
    callback_data: JSON.stringify({
      command: "next",
      value: "Keyingi",
    }),
  },
];
const nextPageEnd = [
  {
    text: "⏮",
    callback_data: JSON.stringify({
      command: "prev",
      value: "Avvalgi",
    }),
  },
];

const empty = [
  {
    text: "",
    callback_data: JSON.stringify({
      command: "empty",
      value: "empty",
    }),
  },
];
const reform = {
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
};

const vacanciesIn = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "RoyalTaxi ga Dispecherlik uchun",
          callback_data: JSON.stringify({
            command: "showVacancies",
            value: "taxi",
          }),
        },
      ],
      [
        {
          text: "Oilkaviy Aptekaga Sotuvchilik",
          callback_data: JSON.stringify({
            command: "showVacancies",
            value: "pharmacy",
          }),
        },
      ],
      [
        {
          text: "Enter o'quv markaziga Ustozlik",
          callback_data: JSON.stringify({
            command: "showVacancies",
            value: "teacher",
          }),
        },
      ],
    ],
  }),
};
const registerStart = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "Ro'yxatdan o'tish",
          callback_data: JSON.stringify({
            command: "registerstart",
            value: "registerstart",
          }),
        },
        {
          text: "Resume yuborish",
          callback_data: JSON.stringify({
            command: "document",
            value: "Resume",
          }),
        },
      ],
    ],
  }),
};
const gender = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "Erkak",
          callback_data: JSON.stringify({
            command: "men",
            value: "Erkak",
          }),
        },
        {
          text: "Ayol",
          callback_data: JSON.stringify({
            command: "women",
            value: "Ayol",
          }),
        },
      ],
    ],
  }),
};
const academicDegree = {
  reply_markup: JSON.stringify({
    inline_keyboard: [
      [
        {
          text: "O'rta maxsus",
          callback_data: JSON.stringify({
            command: "medium",
            value: "O'rta maxsus",
          }),
        },
        {
          text: "Oliy",
          callback_data: JSON.stringify({
            command: "higher",
            value: "Oliy",
          }),
        },
      ],
    ],
  }),
};

module.exports = {
  questionarieStatus,
  nextPage,
  reform,
  registerStart,
  gender,
  academicDegree,
  addQuestion,
  nextPageEnd,
  empty,
  vacancies,
  vacanciesIn,
  remove,
  adminHome,
  vacanciesHome,
  nextVacanciesEnd,
  nextVacancies,
};
