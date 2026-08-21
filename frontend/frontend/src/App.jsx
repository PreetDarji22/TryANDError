import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import QuestionDetail from './pages/QuestionDetail';
import AskQuestion from './pages/AskQuestion';
import UserProfile from './pages/UserProfile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="questions/:id" element={<QuestionDetail />} />
          <Route path="ask" element={<AskQuestion />} />
          <Route path="users/:id" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
