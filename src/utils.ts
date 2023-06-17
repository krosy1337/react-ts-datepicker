export const daysOfTheWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
const VISIBLE_CELLS_AMOUNT = 7 * 6


export interface DateCellItem {
    year: number,
    month: number,
    date: number,
    type: "prev" | "next" | "current",
}

export const getDaysInAMonth = (year: number, month: number) => {
    const nextMonthDate = new Date(year, month + 1, 1)

    nextMonthDate.setMinutes(-1)
    return nextMonthDate.getDate()
}

const sundayWeekToMondayWeekDayMap: Record<number, number> = {
    0: 6,
    1: 0,
    2: 1,
    3: 2,
    4: 3,
    5: 4,
    6: 5,
}

const getDayOfTheWeek = (date: Date) => {
    const day = date.getDay()

    return sundayWeekToMondayWeekDayMap[day]
}

export const getPreviousMonthDays = (year: number, month: number) => {
    const currentMonthFirstDay = new Date(year, month, 1)
    const prevMonthCellAmount = getDayOfTheWeek(currentMonthFirstDay)

    const dateCells: DateCellItem[] = []

    const [cellYear, cellMonth] = month === 0 ? [year - 1, 11] : [year, month - 1]

    const prevMonthDaysAmount = getDaysInAMonth(year, month - 1)

    for (let i = 0; i < prevMonthCellAmount; i++) {
        dateCells.push({
            year: cellYear,
            month: cellMonth,
            date: prevMonthDaysAmount - i,
            type: "prev",
        })
    }

    dateCells.reverse()

    return dateCells
}

export const getNextMonthDays = (year: number, month: number) => {
    const currentMonthFirstDay = new Date(year, month, 1)
    const prevMonthCellAmount = getDayOfTheWeek(currentMonthFirstDay)


    const daysAmount = getDaysInAMonth(year, month)

    const nextMonthDays = VISIBLE_CELLS_AMOUNT - daysAmount - prevMonthCellAmount

    const dateCells: DateCellItem[] = []

    const [cellYear, cellMonth] = month === 11 ? [year + 1, 0] : [year, month + 1]

    for (let i = 1; i <= nextMonthDays; i++) {
        dateCells.push({
            year: cellYear,
            month: cellMonth,
            date: i,
            type: "next",
        })
    }

    return dateCells
}

export const getCurrentMonthDays = (year: number, month: number, numberOfDays: number) => {
    const days: DateCellItem[] = []

    for (let i = 1; i <= numberOfDays; i++) {
        days.push({
            year,
            month,
            date: i,
            type: "current",
        })
    }

    return days
}

const addLeadingZeroIfNeed = (value: number) => {
    if (value > 9) {
        return value.toString()
    }

    return `0${value}`
}

export const getInputValueFromDate = (value: Date) => {
    const date = addLeadingZeroIfNeed(value.getDate())
    const month = addLeadingZeroIfNeed(value.getMonth() + 1)
    const year = value.getFullYear()

    return `${date}-${month}-${year}`
}

const validValueRegex = /^\d{2}-\d{2}-\d{4}$/

export const isValidDateString = (value: string) => {
    if (!validValueRegex.test(value)) {
        return false
    }
    const [date, month, year] = value.split("-").map(v => parseInt(v, 10))

    if (month < 1 || month > 12 || date < 1) {
        return false
    }

    const maxDaysInAMonth = getDaysInAMonth(year, month - 1)

    if (date > maxDaysInAMonth) {
        return false
    }

    return true
}

export const getDateFromInputValue = (inputValue: string) => {
    if (!isValidDateString(inputValue)) {
        return
    }

    const [date, month, year] = inputValue.split("-").map(v => parseInt(v, 10))

    const dateObj = new Date(year, month - 1, date)

    return dateObj
}


export const isToday = (todayDate: Date, cell: DateCellItem) => {
    return todayDate.getFullYear() === cell.year && todayDate.getMonth() === cell.month && todayDate.getDate() === cell.date
}

export function isInRange(value: Date, min?: Date, max?: Date) {
    if (min && max) {
        return isSmallerThanDate(value, max) && isBiggerThanDate(value, min)
    }

    if (min) {
        return isBiggerThanDate(value, min)
    }

    if (max) {
        return isSmallerThanDate(value, max)
    }

    return true
}

function isBiggerThanDate(value: Date, date: Date) {
    if (value.getFullYear() > date.getFullYear()) {
        return true
    }

    if (value.getFullYear() < date.getFullYear()) {
        return false
    }

    if (value.getMonth() > date.getMonth()) {
        return true
    }

    if (value.getMonth() < date.getMonth()) {
        return false
    }

    return value.getDate() >= date.getDate()
}

function isSmallerThanDate(value: Date, date: Date) {
    if (value.getFullYear() > date.getFullYear()) {
        return false
    }

    if (value.getFullYear() < date.getFullYear()) {
        return true
    }

    if (value.getMonth() > date.getMonth()) {
        return false
    }

    if (value.getMonth() < date.getMonth()) {
        return true
    }

    return value.getDate() <= date.getDate()
}