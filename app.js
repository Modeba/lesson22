const form = document.querySelector("form");
const titleInput = form.querySelector("#title");
const priceInput = form.querySelector("#price");
const discountInput = form.querySelector("#discount");
const categoryInput = form.querySelector("#category");
const imageInput = form.querySelector("#image");
const productsListContainer = document.querySelector(".products-list");
const submitBtn = form.querySelector("button[type=submit]");

let currentEditId = null;

async function addNewProductAsync(productData) {
	try {
		const response = await fetch("https://dummyjson.com/products/add", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(productData),
		});

		if (!response.ok) {
			throw new Error("პროდუქტის დამატება ვერ მოხდა");
		}

		const data = await response.json();
		console.log(data);

		const li = createProductElement(data);
		productsListContainer.prepend(li);

		form.reset();
	} catch (error) {
		console.log(error);
	} finally {
		console.log("finaly");
	}
}

async function deleteProduct(id) {
	try {
		const response = await fetch(`https://dummyjson.com/products/${id}`, {
			method: "DELETE",
		});

		if (!response.ok) {
			throw new Error("წაშლა ვერ მოხერხდა");
		}

		const data = await response.json();
		console.log(data);

		const li = productsListContainer.querySelector(`[data-id="${id}"]`);
		if (li) {
			li.remove();
		}
	} catch (error) {
		console.log(error);
	}
}

async function getSingleProduct(id) {
	try {
		const response = await fetch(`https://dummyjson.com/products/${id}`);
		const data = await response.json();
		return data;
	} catch (e) {
		console.log("Error - ", e);
	}
}

function fillEditForm(product) {
	titleInput.value = product.title;
	priceInput.value = product.price;
	discountInput.value = product.discountPercentage;
	categoryInput.value = product.category;
	imageInput.value = product.thumbnail;

	currentEditId = product.id;
	submitBtn.textContent = "პროდუქტის რედაქტირება";

	form.scrollIntoView({ behavior: "smooth" });
}

async function updateProduct(id, updatedData) {
	try {
		const response = await fetch(`https://dummyjson.com/products/${id}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(updatedData),
		});

		if (!response.ok) {
			throw new Error("რედაქტირება ვერ მოხერხდა");
		}

		const data = await response.json();
		console.log(data);

		const oldLi = productsListContainer.querySelector(`[data-id="${id}"]`);
		if (oldLi) {
			const newLi = createProductElement({ ...data, id });
			oldLi.replaceWith(newLi);
		}

		currentEditId = null;
		submitBtn.textContent = "პროდუქტის დამატება";
		form.reset();
	} catch (error) {
		console.log(error);
	}
}

let actionsInitialized = false;

function productActions() {
	if (actionsInitialized) return;
	actionsInitialized = true;

	productsListContainer.addEventListener("click", async (e) => {
		const editBtn = e.target.closest(".edit-btn");
		const deleteBtn = e.target.closest(".delete-btn");

		if (editBtn) {
			const data = await getSingleProduct(editBtn.dataset.productId);
			if (data) fillEditForm(data);
		}

		if (deleteBtn) {
			deleteProduct(deleteBtn.dataset.productId);
		}
	});
}

function createProductElement(product) {
	const li = document.createElement("li");
	li.className = "product-item";
	li.dataset.id = product.id;

	const hasDiscount = Number(product.discountPercentage) > 0;
	const discountedPrice = (
		product.price *
		(1 - (product.discountPercentage || 0) / 100)
	).toFixed(2);

	li.innerHTML = `
		<img class="product-image" src="${product.thumbnail}" alt="${product.title}" />
		<div class="product-info">
			<h3 class="product-title">${product.title}</h3>
			<span class="product-category">${product.category}</span>
			<div class="product-price">
				<span class="price-current">$${hasDiscount ? discountedPrice : product.price}</span>
				${hasDiscount ? `<span class="price-original">$${product.price}</span>` : ""}
			</div>
		</div>
		<div class="product-actions">
			<button type="button" class="edit-btn" data-product-id="${product.id}">edit</button>
			<button type="button" class="delete-btn" data-product-id="${product.id}">delete</button>
		</div>
	`;

	return li;
}

function renderProductsTable(products) {
	productsListContainer.innerHTML = "";

	products.forEach((product) => {
		const li = createProductElement(product);
		productsListContainer.appendChild(li);
	});

	productActions();
}

function getAllProducts() {
	fetch("https://dummyjson.com/products?limit=5")
		.then((response) => {
			if (!response.ok) {
				throw new Error("http error " + response.status);
			}
			return response.json();
		})
		.then((data) => {
			console.log(data.products);
			renderProductsTable(data.products);
		})
		.catch((error) => {
			console.log(error);
		})
		.finally(() => {
		});
}

getAllProducts();

form.addEventListener("submit", (e) => {
	e.preventDefault();

	const newProduct = {
		title: titleInput.value,
		price: priceInput.value,
		discountPercentage: discountInput.value,
		category: categoryInput.value,
		thumbnail: imageInput.value,
		rating: 5,
		stock: 10,
	};

	if (currentEditId) {
		updateProduct(currentEditId, newProduct);
	} else {
		addNewProductAsync(newProduct);
	}
});
