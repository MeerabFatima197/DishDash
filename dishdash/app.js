const menuToggle = document.querySelector("#menu-toggle");
const navigation = document.querySelector("#primary-navigation");
const cartCount = document.querySelector("#cart-count");
const cartStatus = document.querySelector("#cart-status");
const cartToggle = document.querySelector("#cart-toggle");
const cartPanel = document.querySelector("#cart-panel");
const cartClose = document.querySelector("#cart-close");
const cartItems = document.querySelector("#cart-items");
const cartEmpty = document.querySelector("#cart-empty");
const cartTotal = document.querySelector("#cart-total");
const cart = new Map();
let statusTimeout;

const formatPrice = (priceInCents) => `$${(priceInCents / 100).toFixed(2)}`;

function renderCart() {
  const totalItems = [...cart.values()].reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = [...cart.values()].reduce(
    (sum, item) => sum + item.priceInCents * item.quantity,
    0,
  );

  cartCount.textContent = String(totalItems);
  cartToggle.setAttribute(
    "aria-label",
    `Open shopping cart, ${totalItems} ${totalItems === 1 ? "item" : "items"}`,
  );
  cartEmpty.classList.toggle("hidden", totalItems > 0);
  cartItems.replaceChildren();

  cart.forEach((item, product) => {
    const row = document.createElement("li");
    row.className = "flex items-start justify-between gap-3 py-4";

    const details = document.createElement("div");
    details.className = "min-w-0";

    const name = document.createElement("p");
    name.className = "font-bold";
    name.textContent = product;

    const quantity = document.createElement("p");
    quantity.className = "mt-1 text-sm text-[#666]";
    quantity.textContent = `${item.quantity} × ${formatPrice(item.priceInCents)}`;
    details.append(name, quantity);

    const actions = document.createElement("div");
    actions.className = "flex shrink-0 flex-col items-end gap-2";

    const subtotal = document.createElement("span");
    subtotal.className = "font-bold";
    subtotal.textContent = formatPrice(item.quantity * item.priceInCents);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.dataset.removeProduct = product;
    removeButton.className =
      "rounded text-sm text-[#666] underline decoration-[#bbb] underline-offset-2 transition-colors hover:text-dish-red focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-dish-red";
    removeButton.setAttribute("aria-label", `Remove ${product} from cart`);
    removeButton.textContent = "Remove";

    actions.append(subtotal, removeButton);
    row.append(details, actions);
    cartItems.append(row);
  });

  cartTotal.textContent = formatPrice(totalPrice);
}

function closeCart(restoreFocus = true) {
  cartPanel.classList.add("hidden");
  cartToggle.setAttribute("aria-expanded", "false");

  if (restoreFocus) {
    cartToggle.focus();
  }
}

menuToggle.addEventListener("click", () => {
  const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isExpanded));
  menuToggle.setAttribute(
    "aria-label",
    isExpanded ? "Open navigation menu" : "Close navigation menu",
  );
  navigation.classList.toggle("hidden", isExpanded);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (!window.matchMedia("(max-width: 767px)").matches) {
      return;
    }

    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");
    navigation.classList.add("hidden");
  });
});

document.querySelectorAll("[data-add-to-cart]").forEach((button) => {
  button.addEventListener("click", () => {
    const product = button.dataset.product;
    const priceInCents = Math.round(Number(button.dataset.price) * 100);
    const item = cart.get(product);
    cart.set(product, {
      priceInCents,
      quantity: (item?.quantity || 0) + 1,
    });
    renderCart();

    const totalItems = [...cart.values()].reduce((sum, cartItem) => sum + cartItem.quantity, 0);
    cartStatus.textContent = `${product} added to your cart (${totalItems} ${
      totalItems === 1 ? "item" : "items"
    }).`;
    cartStatus.classList.remove("hidden");
    window.clearTimeout(statusTimeout);
    statusTimeout = window.setTimeout(() => cartStatus.classList.add("hidden"), 3000);
  });
});

cartToggle.addEventListener("click", () => {
  const isExpanded = cartToggle.getAttribute("aria-expanded") === "true";
  if (isExpanded) {
    closeCart();
    return;
  }

  cartPanel.classList.remove("hidden");
  cartToggle.setAttribute("aria-expanded", "true");
  cartClose.focus();
});

cartClose.addEventListener("click", () => closeCart());

cartItems.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-product]");
  if (!removeButton) {
    return;
  }

  cart.delete(removeButton.dataset.removeProduct);
  renderCart();
  (cartItems.querySelector("[data-remove-product]") || cartClose).focus();
});

document.addEventListener("click", (event) => {
  if (
    cartToggle.getAttribute("aria-expanded") === "true" &&
    !cartPanel.contains(event.target) &&
    !cartToggle.contains(event.target)
  ) {
    closeCart(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartToggle.getAttribute("aria-expanded") === "true") {
    closeCart();
  }
});

renderCart();
