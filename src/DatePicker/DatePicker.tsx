import React, {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react"
import {
    DateCellItem,
    daysOfTheWeek,
    getCurrentMonthDays, getDateFromInputValue,
    getDaysInAMonth, getInputValueFromDate,
    getNextMonthDays,
    getPreviousMonthDays, isInRange, isToday, months
} from "../utils"

import {clsx} from "clsx"

interface DatePickerProps {
    value: Date,
    onChange: (value: Date) => void,
    min?: Date,
    max?: Date,
}

function useLatest<T>(value: T) {
    const valueRef = useRef(value)

    useLayoutEffect(() => {
        valueRef.current = value
    }, [value])

    return valueRef
}

export const DatePicker = ({value, onChange, min, max}: DatePickerProps) => {
    const [showPopup, setShowPopup] = useState(false)
    const [inputValue, setInputValue] = useState("")
    const elementRef = useRef<HTMLDivElement>(null)

    useLayoutEffect(() => {
        setInputValue(getInputValueFromDate(value))
    }, [value])

    const updateValueOnPopupCloseAction = () => {

        setShowPopup(false)

        const date = getDateFromInputValue(inputValue)

        if (!date) {

            setInputValue(getInputValueFromDate(value))
            return
        }
        const isDateInRange = isInRange(date, min, max)

        if (!isDateInRange) {
            return
        }
        onChange(date)
    }

    const latestUpdateValueFromInput = useLatest(updateValueOnPopupCloseAction)

    useEffect(() => {
        const element = elementRef.current

        if (!element) return

        const onDocumentClick = (e: MouseEvent) => {
            const target = e.target

            if (!(target instanceof Node)) {
                return
            }

            if (element.contains(target)) {
                return
            }

            latestUpdateValueFromInput.current()
        }

        document.addEventListener("click", onDocumentClick)

        return () => {
            document.removeEventListener("click", onDocumentClick)
        }
    }, [latestUpdateValueFromInput])

    const handleChange = (value: Date) => {
        onChange(value)
        setShowPopup(false)
    }

    const onInputValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(e.target.value.trim())
    }

    const onClick = () => {
        setShowPopup(true)
    }

    const [inputValueDate, isValidInputValue] = useMemo(() => {
        const date = getDateFromInputValue(inputValue)
        if (!date) {
            return [undefined, false]
        }

        const isDateInRange = isInRange(date, min, max)

        return [date, isDateInRange]
    }, [inputValue, min, max])

    const onKeyDown = (e: React.KeyboardEvent) => {
        if (e.key !== "Enter") {
            return
        }

        updateValueOnPopupCloseAction()
    }

    return (
        <div ref={elementRef} style={{position: "relative",}}>
            <input className="DateInput" value={inputValue} onChange={onInputValueChange} onKeyDown={onKeyDown} type="text"
                   onClick={onClick}
                   style={{
                       borderColor: isValidInputValue ? "" : "red",
                       color: isValidInputValue ? "" : "red",
                   }}/>
            {showPopup &&
                <div style={{position: "absolute", top: "100%", left: 0}}>
                    <DatePickerPopupContent selectedValue={value} inputValueDate={inputValueDate}
                                            onChange={handleChange} min={min} max={max}/>
                </div>
            }
        </div>
    )
}


interface DatePickerPopupContentProps {
    selectedValue: Date
    inputValueDate?: Date
    min?: Date
    max?: Date
    onChange: (value: Date) => void
}

const DatePickerPopupContent = ({selectedValue, inputValueDate, onChange, min, max}: DatePickerPopupContentProps) => {
    const [panelYear, setPanelYear] = useState(() => selectedValue.getFullYear())
    const [panelMonth, setPanelMonth] = useState(() => selectedValue.getMonth())
    const todayDate = useMemo(() => new Date(), [])

    useLayoutEffect(() => {
        if (!inputValueDate) {
            return
        }

        setPanelMonth(inputValueDate.getMonth())
        setPanelYear(inputValueDate.getFullYear())
    }, [inputValueDate])

    const [year, month, day] = useMemo(() => {
        const currentYear = selectedValue.getFullYear()
        const currentMonth = selectedValue.getMonth()
        const currentDay = selectedValue.getDate()

        return [currentYear, currentMonth, currentDay]
    }, [selectedValue])

    const dateCells = useMemo(() => {
        const daysInAMonth = getDaysInAMonth(panelYear, panelMonth)

        const currentMonthDays = getCurrentMonthDays(panelYear, panelMonth, daysInAMonth)
        const prevMonthDays = getPreviousMonthDays(panelYear, panelMonth)
        const nextMonthDays = getNextMonthDays(panelYear, panelMonth)

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]
    }, [panelYear, panelMonth])

    const onDateSelect = (item: DateCellItem) => {
        onChange(new Date(item.year, item.month, item.date))
    }

    const nextYear = () => {
        setPanelYear(panelYear + 1)
    }
    const prevYear = () => {
        setPanelYear(panelYear - 1)
    }
    const nextMonth = () => {
        if (panelMonth === 11) {
            setPanelMonth(0)
            setPanelYear(panelYear + 1)
        } else {
            setPanelMonth(panelMonth + 1)
        }
    }
    const prevMonth = () => {
        if (panelMonth === 0) {
            setPanelMonth(11)
            setPanelYear(panelYear - 1)
        } else {
            setPanelMonth(panelMonth - 1)
        }
    }
    return (
        <div className="Calendar">
            <div className="CalendarDate">
                {months[panelMonth]} {panelYear}
            </div>
            <div className="CalendarControls">
                <div>
                    <button className="CalendarControlButton" onClick={prevYear}>Prev Year</button>
                    <button className="CalendarControlButton" onClick={prevMonth}>Prev Month</button>
                </div>
                <div>
                    <button className="CalendarControlButton" onClick={nextMonth}>Next Month</button>
                    <button className="CalendarControlButton" onClick={nextYear}>Next Year</button>
                </div>
            </div>
            <div className="CalendarPanel">
                {daysOfTheWeek.map((weekDay) => <div key={weekDay} className="CalendarPanelItem">{weekDay}</div>)}
                {dateCells.map((cell) => {
                        const isSelectedDate = cell.year === year && cell.month === month && cell.date === day
                        const isTodayDate = isToday(todayDate, cell)
                        const isNotCurrent = cell.type !== "current"
                        const isDateInRange = isInRange(new Date(cell.year, cell.month, cell.date), min, max)
                        return <div
                            className={clsx("CalendarPanelItem",
                                isSelectedDate && "CalendarPanelItem--selected",
                                isTodayDate && "CalendarPanelItem--today",
                                isNotCurrent && "CalendarPanelItem--not-current",
                                !isDateInRange && "CalendarPanelItem--not-in-range",
                            )}
                            key={`${cell.date}-${cell.month}-${cell.year}`}
                            onClick={() => isDateInRange && onDateSelect(cell)}>
                            <div className="CalendarPanelItem__date">
                                {cell.date}
                            </div>
                        </div>
                    }
                )}
            </div>
        </div>
    )
}
