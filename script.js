let items = [];
try {
  items = JSON.parse(localStorage.getItem("wishlist") || "[]");
} catch (e) {
  items = [];
}

const list = document.getElementById("list");

function save() {
  try { localStorage.setItem("wishlist", JSON.stringify(items)); } catch (e) {}
}

function money(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "EUR" });
}

function render() {
  list.innerHTML = "";

  if (items.length === 0) {
    list.innerHTML = '<li class="empty">Nothing here yet. Add your first item above.</li>';
  }

  items.forEach((item, i) => {
    const li = document.createElement("li");
    if (item.done) li.className = "done";

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = item.done;
    check.setAttribute("aria-label", "Bought " + item.name);
    check.onchange = () => { item.done = check.checked; save(); render(); };

    const name = document.createElement("span");
    name.className = "n";
    name.textContent = item.name;

    const price = document.createElement("span");
    price.className = "p";
    price.textContent = money(item.price);

    const del = document.createElement("button");
    del.className = "del";
    del.textContent = "×";
    del.setAttribute("aria-label", "Delete " + item.name);
    del.onclick = () => { items.splice(i, 1); save(); render(); };

    li.append(check, name, price, del);
    list.append(li);
  });

  const total = (filter) => items.filter(filter).reduce((sum, x) => sum + x.price, 0);
  document.getElementById("left").textContent = money(total(x => !x.done));
  document.getElementById("spent").textContent = money(total(x => x.done));
}

document.getElementById("f").onsubmit = (e) => {
  e.preventDefault();
  const name = document.getElementById("name");
  const price = document.getElementById("price");
  items.push({ name: name.value.trim(), price: parseFloat(price.value) || 0, done: false });
  name.value = "";
  price.value = "";
  save();
  render();
  name.focus();
};

render();
