import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Dashboard from './Dashboard';
import './styles.scss';
import { useState } from 'react';
const urlCode = new URLSearchParams(window.location.search).get('code');
function App() {
  const [loginNeeded, setLoginNeeded] = useState(false);
  if (urlCode) localStorage.setItem('code', urlCode);
  const code = urlCode ?? localStorage.getItem('code');
  if (code) window.history.pushState({}, '/', '/');
  if (loginNeeded) return <Login />;
  return code ? (
    <Dashboard code={code} setLoginNeeded={setLoginNeeded} />
  ) : (
    <Login />
  );
}

export default App;
