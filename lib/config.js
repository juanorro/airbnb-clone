export default {
  costs: {
    default_weekday: 30,
    default_weekend: 50,

    custom: {
      2022: {
        7: {
          default_weekday: 70,
          default_weekend: 170,
          24: 100,
          25: 100,
        },
      },
    },
  },
  blocked: {
    2022: {
      7: [20, 21, 22],
    },
  },
  booked: {
    2022: {
      7: [17, 24, 25],
    },
  },
}