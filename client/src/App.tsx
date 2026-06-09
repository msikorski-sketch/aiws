import { Routes, Route } from 'react-router-dom';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import RightRail from './components/RightRail';
import Feed from './pages/Feed';
import Bookmarks from './pages/Bookmarks';
import Tags from './pages/Tags';
import Sources from './pages/Sources';
import Digest from './pages/Digest';
import Ask from './pages/Ask';
import Alerts from './pages/Alerts';
import Models from './pages/Models';
import Papers from './pages/Papers';
import ForYou from './pages/ForYou';
import Trends from './pages/Trends';

export default function App() {
  return (
    <div className="flex h-full flex-col">
      <Topbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/tag/:tag" element={<Feed />} />
            <Route path="/digest" element={<Digest />} />
            <Route path="/ask" element={<Ask />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/models" element={<Models />} />
            <Route path="/papers" element={<Papers />} />
            <Route path="/for-you" element={<ForYou />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/sources" element={<Sources />} />
            <Route path="*" element={<Feed />} />
          </Routes>
        </main>
        <RightRail />
      </div>
    </div>
  );
}
