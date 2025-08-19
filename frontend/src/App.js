import React, { useState } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';

const App = () => {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <div>
          <Login setUser={setUser} />
          <Register />
        </div>
      ) : (
        <Chat user={user} />
      )}
    </div>
  );
};

export default App;
