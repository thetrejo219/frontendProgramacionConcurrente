import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('https://backendprogramacionconcurrente.onrender.com');

function App() {
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');
  const [disable, setDisable] = useState(false);
  const [messages, setMessages] = useState<{ body: string; from: string }[]>([]);
  const url = 'https://backendprogramacionconcurrente.onrender.com/api/';

  const [storedMessages, setStoredMessages] = useState<{ message: string; from: string }[]>([]);
  const [firstTime, setFirstTime] = useState(false);

  useEffect(() => {
    const receivedMessage = (message: { body: string; from: string }) => {
      setMessages([message, ...messages]);
    };
    socket.on('message', receivedMessage);

    return () => {
      socket.off('message', receivedMessage);
    };
  }, [messages]);

  if (!firstTime) {
    const obtenerDatos = async () => {
      try {
        const { data } = await axios.get(url + 'messages');
        setStoredMessages(data);
      } catch (error) {
        console.log(error);
      }
    };
    obtenerDatos();
    setFirstTime(true);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (nickname !== '') {
      socket.emit('message', message, nickname);
      const newMessage = {
        body: message,
        from: 'Yo',
      };
      setMessages([newMessage, ...messages]);
      setMessage('');
      axios.post(url + 'save', {
        message: message,
        from: nickname,
      });
    } else {
      alert('Debes de poner un nickname para poder enviar un mensaje');
    }
  };

  const nicknameSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setNickname(nickname);
    setDisable(true);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-md mt-6">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h5 className="text-center text-lg font-bold text-gray-700 mb-4">CHAT</h5>
          <form onSubmit={nicknameSubmit} className="mb-4">
            <div className="flex gap-2">
              <input
                type="text"
                id="nickname"
                placeholder="Nickname..."
                className="flex-1 border rounded-md px-3 py-2 text-gray-700 disabled:bg-gray-200"
                onChange={(e) => setNickname(e.target.value)}
                disabled={disable}
              />
              <button
                className="bg-blue-500 text-white rounded-md px-4 py-2 hover:bg-blue-600 disabled:bg-gray-400"
                type="submit"
                disabled={disable}
              >
                Establecer
              </button>
            </div>
          </form>

          <form onSubmit={handleSubmit}>
            <div className="flex gap-2">
              <input
                type="text"
                id="message"
                placeholder="Mensaje..."
                className="flex-1 border rounded-md px-3 py-2 text-gray-700"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
              />
              <button
                className="bg-green-500 text-white rounded-md px-4 py-2 hover:bg-green-600"
                type="submit"
              >
                Enviar
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white shadow-md rounded-lg mt-6 p-4">
          <div className="space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.from === 'Yo' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.from === 'Yo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <small>
                    <strong>{msg.from}:</strong> {msg.body}
                  </small>
                </div>
              </div>
            ))}

            {storedMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.from === nickname ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.from === nickname ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <small>
                    <strong>{msg.from}:</strong> {msg.message}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
