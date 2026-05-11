export const getTime = (val) => {
  try {
    if (!val) return 0;

    if (val.seconds) {
      return val.seconds * 1000;
    }

    return new Date(val).getTime();
  } catch {
    return 0;
  }
};

export const getMonthKey = (item) => {
  try {
    if (item?.monthKey && /^\d{4}-\d{2}$/.test(item.monthKey)) {
      return item.monthKey;
    }

    if (item?.date) {
      const d = new Date(item.date);

      if (!isNaN(d)) {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
          2,
          "0"
        )}`;
      }
    }

    return "";
  } catch {
    return "";
  }
};

export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
