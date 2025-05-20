import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Header from './components/Header';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import LostItemForm from './components/LostItemForm';
import FoundItemForm from './components/FoundItemForm';
import EditItemForm from './components/EditItemForm';
import UserProfile from './components/UserProfile';

function App() {
  const isAuthenticated = localStorage.getItem('token') ? true : false;

  const ProtectedRoute = ({ element }) => {
    return isAuthenticated ? element : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="app">
        <Header />
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/items" element={<ProtectedRoute element={<ItemList />} />} />
            <Route path="/items/:id" element={<ProtectedRoute element={<ItemDetail />} />} />
            <Route path="/edit-item/:id" element={<ProtectedRoute element={<EditItemForm />} />} />
            <Route path="/lost-item" element={<ProtectedRoute element={<LostItemForm />} />} />
            <Route path="/found-item" element={<ProtectedRoute element={<FoundItemForm />} />} />
            
            <Route path="/profile" element={<ProtectedRoute element={<UserProfile />} />} />
            <Route path="/profile/:login" element={<ProtectedRoute element={<UserProfile />} />} />
            
            <Route path="/" element={isAuthenticated ? <Navigate to="/items" /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
