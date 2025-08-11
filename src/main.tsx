import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('main.tsx loading...');
createRoot(document.getElementById("root")!).render(<App />);
console.log('main.tsx loaded successfully');
