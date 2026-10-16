let items = [];
try {
  items = JSON.parse(localStorage.getItem("wishlist") || "[]");
} catch (e) {
  items = [];
}

const list = document.getElementById("list");

function save() {
  try {
    localStorage.setItem("wishlist", JSON.stringify(items));
  } catch (e) {
    alert("Could not save. The browser storage may be full, try smaller pictures.");
  }
}

function money(n) {
  return n.toLocaleString(undefined, { style: "currency", currency: "EUR" });
}

// Shrinks an uploaded photo to max 240px so it fits in storage
function shrink(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, 240 / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => resolve("");
      img.src = reader.result;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
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

    let pic;
    if (item.image) {
      pic = document.createElement("img");
      pic.className = "pic";
      pic.src = item.image;
      pic.alt = item.name;
      pic.onerror = () => {
        const ph = document.createElement("div");
        ph.className = "pic none";
        ph.textContent = "🛍️";
        pic.replaceWith(ph);
      };
    } else {
      pic = document.createElement("div");
      pic.className = "pic none";
      pic.textContent = "🛍️";
    }

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

    li.append(check, pic, name, price, del);
    list.append(li);
  });

  const total = (filter) => items.filter(filter).reduce((sum, x) => sum + x.price, 0);
  document.getElementById("left").textContent = money(total(x => !x.done));
  document.getElementById("spent").textContent = money(total(x => x.done));
}

document.getElementById("f").onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById("name");
  const price = document.getElementById("price");
  const url = document.getElementById("url");
  const file = document.getElementById("file");

  // An uploaded photo wins over a pasted link
  let image = url.value.trim();
  if (file.files[0]) image = await shrink(file.files[0]);

  items.push({
    name: name.value.trim(),
    price: parseFloat(price.value) || 0,
    image: image,
    done: false
  });

  name.value = "";
  price.value = "";
  url.value = "";
  file.value = "";
  save();
  render();
  name.focus();
};

render();
