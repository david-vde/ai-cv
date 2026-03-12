import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {helloWorld} from "./chat/queries/ask-question.jsx";
import {ChatBox} from "./chat/components/ChatBox.jsx";

function App() {
  return (
    <div>
        <ChatBox />
    </div>
  )
}

export default App
