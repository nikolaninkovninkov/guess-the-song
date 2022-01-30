import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Dashboard from './Dashboard';
import './styles.scss';
const urlCode = new URLSearchParams(window.location.search).get('code');
function App() {
  if (urlCode) localStorage.setItem('code', urlCode);
  const code = urlCode ?? localStorage.getItem('code');
  if (code) window.history.pushState({}, '/', '/');
  return code ? <Dashboard code={code} /> : <Login />;
}

export default App;
