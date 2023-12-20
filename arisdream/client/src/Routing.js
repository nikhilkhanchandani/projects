import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Logout from './components/Logout';
import Login from './components/Login';
import Register from './components/Register';
import NotFound from './components/NotFound';
import AddPost from './components/AddPost';
import View from './components/View';

function Routing() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/'>
          <Route path='' element={<Home />} />
          <Route path='view/:id' element={<View />} />
          <Route path='login' element={<Login />} />
          <Route path='register' element={<Register />} />
          <Route path='logout' element={<Logout />} />
          <Route path='addpost' element={<AddPost />} />
        </Route>
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default Routing;
