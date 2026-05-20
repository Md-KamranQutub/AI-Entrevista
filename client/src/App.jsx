import './App.css'
import Homepage from './pages/Homepage'
import Auth from './pages/Auth'
import {Route, Router, Routes} from 'react-router-dom'
import Interview from './pages/Interview'
import InterviewHistory from './pages/InterviewHistory'
import InterviewReport from './pages/InterviewReport'
import Price from './pages/Price'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Homepage/>} />
      <Route path='/login' element={<Auth/>} />
      <Route path='/interview' element={<Interview/>}/>
      <Route path='/history' element={<InterviewHistory/>}/>
      <Route path='/report/:interviewId' element={<InterviewReport/>} />
      <Route path='/pricing' element={<Price/>} />
    </Routes>
  )
}

export default App
