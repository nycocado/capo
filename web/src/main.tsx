import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/global.css'
import CuttingPage from './pages/CuttingPage.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <CuttingPage/>
    </StrictMode>,
)
