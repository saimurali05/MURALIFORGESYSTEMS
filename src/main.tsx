import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import './styles/hero.css';
import './styles/nav.css';
import './styles/services.css';
import './styles/demos.css';
import './styles/apps.css';
import './styles/advantage.css';
import './styles/sections.css';
import './styles/stage.css';
import './styles/automation.css';
import './styles/directory.css';
import './styles/lab.css';
import './styles/process.css';
import './styles/closing.css';
import './styles/glass.css';
import App from './App';
import FilamentArt from './components/hero/FilamentArt';
import { motion } from './motion/controller';
import { initGlassLight } from './motion/glassLight';

motion.init();
initGlassLight();
const params = new URLSearchParams(location.search);
const host = document.getElementById('root')!;
if (params.get('art') === 'ref') {
  // Verification harness: the filament art alone at the reference's native 634×392 crop.
  document.body.style.background = '#000';
  createRoot(host).render(<div data-art-root><FilamentArt refMode /></div>);
} else {
  createRoot(host).render(<App />);
}
