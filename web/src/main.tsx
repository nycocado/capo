import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import './styles/global.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import Home from './pages/Home.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Home/>
    </StrictMode>,
)
