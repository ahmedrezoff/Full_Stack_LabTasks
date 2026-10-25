const http = require("node:http");
const { randomBytes, scryptSync, timingSafeEqual } = require("node:crypto");
const { createStore } = require("./store.js");
const { fail, positiveId, text, onlyFields, productFields, quantity, credentials, readBody } = require("./validate.js");

function sendJSON(res, status, value)
{
    res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(value));
}

function findProduct(data, id)
{
    const product = data.products.find(item => item.id === id);
    if (!product)
    {
        fail(404, "Product not found");
    }
    return product;
}

function publicCustomer(customer)
{
    // Password hash aur salt response mein nahi bhejne.
    return { id: customer.id, name: customer.name, email: customer.email };
}

function cartSummary(data)
{
    let subtotalCents = 0;
    const items = data.cart.map(function(item)
    {
        const product = findProduct(data, item.productId);
        const lineCents = Math.round(product.price * 100) * item.quantity;
        subtotalCents += lineCents;
        return {
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            lineTotal: lineCents / 100
        };
    });

    // Paise/cents mein calculation se decimal rounding ka masla nahi hota.
    let freightCents = 0;
    if (items.length > 0)
    {
        freightCents = 1250;
    }
    return {
        items: items,
        subtotal: subtotalCents / 100,
        freight: freightCents / 100,
        total: (subtotalCents + freightCents) / 100
    };
}

function createApp(file)
{
    const store = createStore(file);

    // Lab 3 jaisi ek shared demo cart hai. Login credentials check karta hai;
    // is lab mein sessions, roles aur protected routes implement nahi kiye.
    return http.createServer(async function(req, res)
    {
        try
        {
            const url = new URL(req.url, "http://localhost");
            const route = url.pathname;
            const productMatch = /^\/products\/([^/]+)$/.exec(route);
            const cartMatch = /^\/cart\/items\/([^/]+)$/.exec(route);
            const orderMatch = /^\/orders\/([^/]+)$/.exec(route);

            if (route === "/health" && req.method === "GET")
            {
                sendJSON(res, 200, { status: "ok", storage: "JSON file" });
                return;
            }

            if ((route === "/products" || productMatch) && req.method === "GET")
            {
                let id = null;
                if (productMatch)
                {
                    id = positiveId(productMatch[1]);
                }
                const data = await store.read();
                if (id === null)
                {
                    sendJSON(res, 200, data.products);
                }
                else
                {
                    sendJSON(res, 200, findProduct(data, id));
                }
                return;
            }

            if (route === "/products" && req.method === "POST")
            {
                const fields = productFields(await readBody(req));
                const product = await store.edit(function(data)
                {
                    const created = { id: data.nextProductId++, ...fields };
                    data.products.push(created);
                    return created;
                });
                sendJSON(res, 201, product);
                return;
            }

            if (productMatch && req.method === "PUT")
            {
                const id = positiveId(productMatch[1]);
                const fields = productFields(await readBody(req));
                const product = await store.edit(function(data)
                {
                    const found = findProduct(data, id);
                    Object.assign(found, fields);
                    return found;
                });
                sendJSON(res, 200, product);
                return;
            }

            if (productMatch && req.method === "DELETE")
            {
                const id = positiveId(productMatch[1]);
                await store.edit(function(data)
                {
                    findProduct(data, id);
                    if (data.cart.some(item => item.productId === id))
                    {
                        fail(409, "Remove this product from the cart first");
                    }
                    data.products = data.products.filter(item => item.id !== id);
                });
                res.writeHead(204);
                res.end();
                return;
            }

            if (route === "/auth/register" && req.method === "POST")
            {
                const fields = credentials(await readBody(req), true);
                const salt = randomBytes(16).toString("hex");
                const passwordHash = scryptSync(fields.password, salt, 64).toString("hex");
                const customer = await store.edit(function(data)
                {
                    if (data.customers.some(item => item.email === fields.email))
                    {
                        fail(409, "Email already registered");
                    }
                    const created = {
                        id: data.nextCustomerId++,
                        name: fields.name,
                        email: fields.email,
                        salt: salt,
                        passwordHash: passwordHash
                    };
                    data.customers.push(created);
                    return publicCustomer(created);
                });
                sendJSON(res, 201, customer);
                return;
            }

            if (route === "/auth/login" && req.method === "POST")
            {
                const fields = credentials(await readBody(req), false);
                const data = await store.read();
                const customer = data.customers.find(item => item.email === fields.email);
                if (!customer)
                {
                    fail(401, "Invalid email or password");
                }
                const hash = scryptSync(fields.password, customer.salt, 64);
                if (!timingSafeEqual(hash, Buffer.from(customer.passwordHash, "hex")))
                {
                    fail(401, "Invalid email or password");
                }
                sendJSON(res, 200, { message: "Login successful", customer: publicCustomer(customer) });
                return;
            }

            if (route === "/cart" && req.method === "GET")
            {
                sendJSON(res, 200, cartSummary(await store.read()));
                return;
            }

            if (route === "/cart/items" && req.method === "POST")
            {
                const body = await readBody(req);
                onlyFields(body, ["productId", "quantity"]);
                if (typeof body.productId !== "number")
                {
                    fail(400, "productId must be a number");
                }
                const id = positiveId(body.productId);
                const amount = quantity(body.quantity);
                const cart = await store.edit(function(data)
                {
                    findProduct(data, id);
                    const existing = data.cart.find(item => item.productId === id);
                    if (existing)
                    {
                        existing.quantity = quantity(existing.quantity + amount);
                    }
                    else
                    {
                        data.cart.push({ productId: id, quantity: amount });
                    }
                    return cartSummary(data);
                });
                sendJSON(res, 200, cart);
                return;
            }

            if (cartMatch && (req.method === "PATCH" || req.method === "DELETE"))
            {
                const id = positiveId(cartMatch[1]);
                let amount;
                if (req.method === "PATCH")
                {
                    const body = await readBody(req);
                    onlyFields(body, ["quantity"]);
                    amount = quantity(body.quantity);
                }
                const cart = await store.edit(function(data)
                {
                    const index = data.cart.findIndex(item => item.productId === id);
                    if (index === -1)
                    {
                        fail(404, "Cart item not found");
                    }
                    if (req.method === "PATCH")
                    {
                        data.cart[index].quantity = amount;
                    }
                    else
                    {
                        data.cart.splice(index, 1);
                    }
                    return cartSummary(data);
                });
                if (req.method === "DELETE")
                {
                    res.writeHead(204);
                    res.end();
                }
                else
                {
                    sendJSON(res, 200, cart);
                }
                return;
            }

            if (route === "/orders" && req.method === "POST")
            {
                const body = await readBody(req);
                onlyFields(body, ["customerId", "recipientName", "depot"]);
                if (typeof body.customerId !== "number")
                {
                    fail(400, "customerId must be a number");
                }
                const customerId = positiveId(body.customerId);
                const recipientName = text(body.recipientName, "Recipient name");
                const depot = text(body.depot, "Delivery depot");
                const order = await store.edit(function(data)
                {
                    if (!data.customers.some(item => item.id === customerId))
                    {
                        fail(404, "Customer not found");
                    }
                    if (data.cart.length === 0)
                    {
                        fail(400, "Cart is empty");
                    }
                    // Prices client se nahi lete. Order mein us waqt ki prices save hoti hain.
                    const summary = cartSummary(data);
                    const created = {
                        id: data.nextOrderId++,
                        customerId: customerId,
                        recipientName: recipientName,
                        depot: depot,
                        ...summary,
                        status: "placed",
                        createdAt: new Date().toISOString()
                    };
                    data.orders.push(created);
                    data.cart = [];
                    return created;
                });
                sendJSON(res, 201, order);
                return;
            }

            if ((route === "/orders" || orderMatch) && req.method === "GET")
            {
                let id = null;
                if (orderMatch)
                {
                    id = positiveId(orderMatch[1]);
                }
                const data = await store.read();
                if (id === null)
                {
                    sendJSON(res, 200, data.orders);
                    return;
                }
                const order = data.orders.find(item => item.id === id);
                if (!order)
                {
                    fail(404, "Order not found");
                }
                sendJSON(res, 200, order);
                return;
            }

            if (["/health", "/products", "/auth/register", "/auth/login", "/cart", "/cart/items", "/orders"].includes(route)
                || productMatch || cartMatch || orderMatch)
            {
                fail(405, "Method not allowed for this route");
            }
            fail(404, "Route not found");
        }
        catch (error)
        {
            if (!error.status)
            {
                console.error(error);
            }
            sendJSON(res, error.status || 500, { error: error.status ? error.message : "Server error" });
        }
    });
}

module.exports = { createApp };
