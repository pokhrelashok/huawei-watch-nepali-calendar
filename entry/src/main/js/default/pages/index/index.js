import app from '@system.app';
import brightness from '@system.brightness';

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
    '2081-05-03': "Raksha Bandhan",
    '2081-05-04': "Gaijatra",
    '2081-05-10': "Krishna Janmasthami",
    '2081-05-21': "Teej",
    '2081-06-17': "Ghatasthapana",
    '2081-06-26': "Vijaya Dashami",
    '2081-07-15': "Laxmi Puja",
    '2081-07-18': "Vai Tika",
    '2081-07-22': "Chhath",
    '2081-09-01': "Maghe Sankranti",
    '2081-11-14': "Maha Shivaratri",
    '2081-12-01': "Fagu Purnima",
};
export default {
    data: {
        bsDate: "",
        adDate: "",
        day: "",
        event: "",
        nextEvents:[],
        currentPage:0,
    },
    swipeEvent(e) {
        if('index' in e){
            this.currentPage = e.index
            console.log(e.index)
            setTimeout(this.closeApp,200);
        }
    },
    closeApp(e) {
        if(this.currentPage == 0 && e&& e.direction=='right'){
            console.log("Terminating")
            app.terminate();
        }
    },
    onInit() {
        brightness.getValue({
            success: function(data){
                console.log('success get brightness value:' + data.value);
            },
            fail: function(data, code) {
                console.log('get brightness fail, code: ' + code + ', data: ' + data);
            },
        });
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

        let searchingForMonth = parseInt(bsDate.month);
        let searchingForDate = parseInt(bsDate.day);
        let iterations = 0;
        let nextEvent = null;
        let nextEvents = [];
        while(iterations<300){
            if(searchingForDate==0) {
                searchingForMonth++;
                searchingForDate =(searchingForDate+1)%32;
                continue;
            }
            const key =`${bsDate.year}-${searchingForMonth < 10 ? '0' + searchingForMonth.toString() : searchingForMonth}-${searchingForDate < 10 ? '0' + searchingForDate.toString() : searchingForDate}`;
            if (key in MajorEvents){
                nextEvent =key
                break;
            }
            iterations++;
            searchingForDate =(searchingForDate+1)%32;
        }

        if(!nextEvent) return;
        let nextEventIndex = 0;
        let dates = Object.keys(MajorEvents);
        for (let i=0;i<dates.length;i++){
            if(dates[i] == nextEvent) nextEventIndex=i;
        }
        dates = dates.splice(nextEventIndex);
        for(let i=0;i<10 && i<dates.length;i++){
            nextEvents.push({date:dates[i],event:MajorEvents[dates[i]]});
        }
        this.nextEvents = nextEvents;
    },
}
