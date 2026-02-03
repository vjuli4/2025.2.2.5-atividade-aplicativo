let db;

// criação do meu banco de dados local (assíncrono)
const request = indexedDB.open("ShoppingDB", 1);//nome e versão

// estrutura do banco. tabela -> chave primária -> id incrementado
request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("items", {
    keyPath: "id",
    autoIncrement: true
  });
};
// banco salvo na variável db
request.onsuccess = function (event) {
  db = event.target.result;
  loadItems(); //itens salvos
};

// função "adicionar item"
function addItem() {
  const input = document.getElementById("itemInput");
  const name = input.value.trim(); // remove espaços extras para evitar repetição no banco de dados 

  if (name === "") return;

  const tx = db.transaction("items", "readwrite"); //alterar ou remover dados
  const store = tx.objectStore("items"); // acessa item
  store.add({ name }); // salva item no bd

  //arrow function
  tx.oncomplete = () => {
    input.value = ""; //limpa campo de texto
    loadItems(); //atualiza a lista
  };
}

// função "remover item"
function removeItem(id) { //recebe id
  const tx = db.transaction("items", "readwrite"); // abre a transição (para alterar)
  const store = tx.objectStore("items");
  store.delete(id); // remove item pelo id

  tx.oncomplete = loadItems; // atualiza lista
}

// funçao "carregar itens"
function loadItems() {
  const list = document.getElementById("itemList");
  list.innerHTML = ""; // limpa a lista antes de carregar

  const tx = db.transaction("items", "readonly"); //transição de leitura
  const store = tx.objectStore("items");
  const request = store.getAll(); //busca todos os itens do bd

  request.onsuccess = () => { //arrow function
    request.result.forEach(item => {
      const li = document.createElement("li"); //cria li
      li.textContent = item.name; // mostra nome

      const btn = document.createElement("button"); //cria butão de remover
      btn.textContent = "❌";
      btn.onclick = () => removeItem(item.id); // associa ao id correto

      //insere tudo na tela
      li.appendChild(btn);
      list.appendChild(li);
    });
  };
}
