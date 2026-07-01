let db;

// opens the same local database used by the Portuguese page
// (same name/version -> items are shared between both languages)
const request = indexedDB.open("ShoppingDB", 1);

request.onupgradeneeded = function (event) {
  db = event.target.result;
  db.createObjectStore("items", {
    keyPath: "id",
    autoIncrement: true
  });
};

request.onsuccess = function (event) {
  db = event.target.result;
  loadItems();
};

// translate button -> goes back to the Portuguese page
document.getElementById("translateBtn").onclick = function () {
  window.location.href = "index.html";
};

// allows adding an item by pressing Enter
document.getElementById("itemInput").addEventListener("keypress", function (e) {
  if (e.key === "Enter") addItem();
});

// "add item" function
function addItem() {
  const input = document.getElementById("itemInput");
  const name = input.value.trim();

  if (name === "") return;

  const tx = db.transaction("items", "readwrite");
  const store = tx.objectStore("items");
  store.add({ name });

  tx.oncomplete = () => {
    input.value = "";
    loadItems();
  };
}

// "edit item" function
function editItem(id, span, editBtn) {
  const currentName = span.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;
  input.className = "edit-input";

  span.replaceWith(input);
  input.focus();

  editBtn.textContent = "💾";
  editBtn.onclick = () => {
    const trimmed = input.value.trim();
    if (trimmed === "") return;

    const tx = db.transaction("items", "readwrite");
    const store = tx.objectStore("items");
    store.put({ id, name: trimmed }); // updates the existing item (same id)

    tx.oncomplete = loadItems;
  };

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      editBtn.click();
    }
    if (e.key === "Escape") {
      input.replaceWith(span);
      editBtn.textContent = "✏️";
      editBtn.onclick = () => editItem(id, span, editBtn);
    }
  });
}

// "remove item" function
function removeItem(id) {
  const tx = db.transaction("items", "readwrite");
  const store = tx.objectStore("items");
  store.delete(id);

  tx.oncomplete = loadItems;
}

// "load items" function
function loadItems() {
  const list = document.getElementById("itemList");
  list.innerHTML = "";

  const tx = db.transaction("items", "readonly");
  const store = tx.objectStore("items");
  const request = store.getAll();

  request.onsuccess = () => {
    request.result.forEach(item => {
      const li = document.createElement("li");

      const span = document.createElement("span");
      span.textContent = item.name;

      const actions = document.createElement("div");
      actions.className = "actions";

      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.className = "edit-btn";
      editBtn.onclick = () => editItem(item.id, span, editBtn);

      const removeBtn = document.createElement("button");
      removeBtn.textContent = "❌";
      removeBtn.className = "remove-btn";
      removeBtn.onclick = () => removeItem(item.id);

      actions.appendChild(editBtn);
      actions.appendChild(removeBtn);
      li.appendChild(span);
      li.appendChild(actions);
      list.appendChild(li);
    });
  };
}
