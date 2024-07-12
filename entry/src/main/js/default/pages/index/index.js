const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const bsCalendarData = {
    2081: [31, 32, 31, 32, 31, 30, 30, 30, 29, 30, 29, 31],
    2082: [31, 30, 31, 32, 31, 31, 30, 29, 30, 29, 30, 30],
    2083: [31, 31, 32, 31, 31, 31, 30, 29, 30, 29, 30, 30],
    2084: [31, 32, 31, 32, 31, 30, 30, 30, 29, 29, 30, 31],
    2085: [31, 32, 31, 32, 31, 30, 29, 30, 29, 30, 29, 30],
    2086: [31, 31, 31, 32, 31, 30, 29, 30, 29, 30, 29, 30],
    2087: [31, 32, 31, 32, 31, 30, 29, 30, 29, 30, 29, 30],
    2088: [31, 31, 31, 32, 31, 30, 29, 30, 29, 30, 29, 30],
    2089: [31, 32, 31, 32, 31, 30, 29, 30, 29, 30, 29, 30],
    2090: [31, 31, 31, 32, 31, 30, 29, 30, 29, 30, 29, 30]
};

const bsBaseYear = 2081;
const bsBaseMonth = 2; // Asar (0-based index, so 3 corresponds to the 4th month, Asar)
const bsBaseDay = 28;
const adBaseDate = new Date(2024, 6, 12); // July 12, 2024 (Month is 0-based)

function addDaysToBSDate(bsYear, bsMonth, bsDay, daysToAdd) {
    while (daysToAdd > 0) {
        const daysInCurrentMonth = bsCalendarData[bsYear][bsMonth];
        if (bsDay + daysToAdd <= daysInCurrentMonth) {
            bsDay += daysToAdd;
            daysToAdd = 0;
        } else {
            daysToAdd -= (daysInCurrentMonth - bsDay + 1);
            bsDay = 1;
            bsMonth++;
            if (bsMonth > 11) {
                bsMonth = 0;
                bsYear++;
                if (!bsCalendarData[bsYear]) {
                    throw new Error("BS calendar data not available for year " + bsYear);
                }
            }
        }
    }
    bsMonth += 1;
    return { year: bsYear, month: bsMonth < 10 ? `0${bsMonth}` : bsMonth, day: bsDay < 10 ? `0${bsDay}` : bsDay };
}
function convertADToBS(adDate) {
    const diffInTime = adDate - adBaseDate;
    const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
    return addDaysToBSDate(bsBaseYear, bsBaseMonth, bsBaseDay, diffInDays);
}

const MajorEvents = {
    '2081-05-03': "Raksha Bandhan"
};

export default {
    data: {
        bsDate: "",
        adDate: "",
        day: "",
        event: "",
        pageIndex: 0,
        pages: ['home', 'next-event'],
    },
    onInit() {
        const today = new Date();
        const adYear = today.getFullYear();
        const adMonth = today.getMonth() + 1;
        const adDay = today.getDate();
        const adDate = `${adYear}-${adMonth < 10 ? '0' + adMonth.toString() : adMonth}-${adDay < 10 ? '0' + adDay.toString() : adDay}`;
        const bsDate = convertADToBS(new Date());
        this.day = weekday[today.getDay()];
        this.adDate = adDate;
        this.bsDate = `${bsDate.year}-${bsDate.month}-${bsDate.day}`;
        this.event = this.bsDate in MajorEvents ? MajorEvents[this.bsDate] : ''
    },
    swipeEvent(e) {
        if (e.direction == "right") {
            app.terminate();
        }
    },
    showValue() {
        this.showValue = !this.showValue;
    },
    onDestroy() { },
}

