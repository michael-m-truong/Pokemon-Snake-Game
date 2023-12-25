import React from 'react'
import ReactDOM from 'react-dom/client'
import SnakeGame from './components/SnakeGame.jsx'
import './index.css'; // Import your CSS file
import ChristmasPresentDialog from './components/ChristmasPresentDialog.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChristmasPresentDialog/>
    <SnakeGame />
  </React.StrictMode>,
)
