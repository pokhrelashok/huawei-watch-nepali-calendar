import app from '@system.app';
import brightness from '@system.brightness';

import EVENTS from './events';
const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DAY_NAMES_NEPALI = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];

const BS_MONTH_DAYS = {
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

const BASE_YEAR = 2081;
const BASE_MONTH = 3;
const BASE_DAY = 28;
const AD_BASE_DATE = new Date(2024, 6, 12);

function addDaysToBSDate(bsYear, bsMonth, bsDay, daysToAdd) {
    while (daysToAdd > 0) {
        const daysInCurrentMonth = BS_MONTH_DAYS[bsYear][bsMonth];
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
                if (!BS_MONTH_DAYS[bsYear]) {
                    throw new Error("BS calendar data not available for year " + bsYear);
                }
            }
        }
    }
    return { year: bsYear, month: bsMonth < 10 ? `0${bsMonth}` : bsMonth, day: bsDay < 10 ? `0${bsDay}` : bsDay };
}
function convertADToBS(adDate) {
    const diffInTime = adDate - AD_BASE_DATE;
    const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
    return addDaysToBSDate(BASE_YEAR, BASE_MONTH, BASE_DAY, diffInDays);
}

function convertToNepaliDigits(str) {
    const nepaliDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
    let nepaliNumber = '';

    for (let i=0;i<str.length;i++){
        let char = str[i];
        if (char >= '0' && char <= '9') {
            nepaliNumber += nepaliDigits[char];
        } else {
            nepaliNumber += char;
        }
    }

    return nepaliNumber;
}


export default {
    data: {
        bsDate: "",
        adDate: "",
        day: "",
        dayNepali: "",
        event: "",
        nextEvents: [],
        currentPage: 0,
    },
    swipeEvent(e) {
        if ('index' in e) {
            this.currentPage = e.index
            console.log(e.index)
            setTimeout(this.closeApp, 200);
        }
    },
    closeApp(e) {
        if (this.currentPage == 0 && e && e.direction == 'right') {
            console.log("Terminating")
            app.terminate();
        }
    },
    onInit() {
        brightness.getValue({
            success: function (data) {
                console.log('success get brightness value:' + data.value);
            },
            fail: function (data, code) {
                console.log('get brightness fail, code: ' + code + ', data: ' + data);
            },
        });

        const today = new Date();
        const adYear = today.getFullYear();
        const adMonth = today.getMonth() + 1;
        const adDay = today.getDate();
        const adDate = `${adYear}-${adMonth < 10 ? '0' + adMonth.toString() : adMonth}-${adDay < 10 ? '0' + adDay.toString() : adDay}`;
        const bsDate = convertADToBS(new Date());

        this.dayNepali = DAY_NAMES_NEPALI[today.getDay()];
        this.day = DAY_NAMES[today.getDay()];
        this.adDate = adDate;
        this.bsDate = convertToNepaliDigits(`${bsDate.year}-${bsDate.month}-${bsDate.day}`);
        this.event = this.bsDate in EVENTS ? EVENTS[this.bsDate] : ''


        for (let index = 0; index < EVENTS.length && this.nextEvents.length <= 8; index++) {
            const event = EVENTS[index];
            const eventDate = new Date(event.date);
            const isToday = eventDate.getDate() == adDay && eventDate.getMonth() + 1 == adMonth && eventDate.getFullYear() == adYear;
            if (isToday) {
                this.event = event.title;
            }
            if (eventDate > today || isToday) {
                const bsDate = convertADToBS(event.date);
                const after =Math.floor(Math.abs(eventDate - today) / (1000 * 60 * 60 * 24));
                this.nextEvents.push({ ...event, day: DAY_NAMES_NEPALI[eventDate.getDay()], bs: convertToNepaliDigits(`${bsDate.year}-${bsDate.month}-${bsDate.day}`), after,afterNepali:convertToNepaliDigits(after.toString()) });
            }
        }
    },
}
