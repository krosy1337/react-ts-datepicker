import "./App.css"
import {DatePicker} from "./DatePicker"
import {useState} from "react"

function App() {
    const [date, setDate] = useState(() => new Date())
    return (
        <DatePicker value={date} onChange={setDate}/>
    )
}

export default App
