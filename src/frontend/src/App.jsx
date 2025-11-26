import { useState, useEffect } from "react";

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao buscar usuários:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1>Lista de Usuários</h1>
      {users.length === 0 ? (
        <p>Nenhum usuário cadastrado</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.nome}</strong> - RFID: {user.rfid_codigo} - Status:{" "}
              {user.ativo ? "Ativo" : "Inativo"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
