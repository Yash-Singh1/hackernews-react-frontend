import React from 'react';
import '../styles/App.css';
import LinkList from './LinkList';
import { Route, Routes } from 'react-router-dom';
import Header from './Header';
import CreateLink from './CreateLink';
import Login from './Login';
import Search from './Search';

function App() {
  return (
    <div className="center w85 mt3">
      <Header />
      <div className="ph3 pt1 pb3 bg-light-gray">
        <Routes>
          <Route path="/" element={<LinkList />} />
          <Route path="/create" element={<CreateLink />} />
          <Route path="/login" element={<Login />} />
          <Route path="/search" element={<Search />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
