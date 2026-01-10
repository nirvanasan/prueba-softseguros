import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, LogOut, User, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface CartItem {
    item_id: number;
    product_name: string;
    price: number;
    quantity: number;
}



export default function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [cartMessage, setCartMessage] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const [savedCarts, setSavedCarts] = useState<any[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    const [itemName, setItemName] = useState("");

    const [itemMessage, setItemMessage] = useState<string | null>(null);

    const [itemPrice, setItemPrice] = useState<number | "">("");
    const [itemPriceDisplay, setItemPriceDisplay] = useState("");




    const token = localStorage.getItem("token");
    console.log(token);

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/");
    };

    // Traer productos
    const fetchProducts = async () => {
        setLoading(true);
        if (!token) return navigate("/");

        try {
            const res = await axios.get("http://127.0.0.1:8000/products/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setProducts(res.data);

            const initialQuantities: Record<number, number> = {};
            res.data.forEach((p: any) => (initialQuantities[p.id] = 1));
            setQuantities(initialQuantities);
        } catch (err: any) {
            console.error("Error al obtener productos:", err);
            if (err.response?.status === 401) navigate("/");
        } finally {
            setLoading(false);
        }
    };

    // Traer carrito
    const fetchCart = async () => {
        if (!token) return;
        try {
            const res = await axios.get("http://127.0.0.1:8000/cart/", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems(res.data.items);

        } catch (err: any) {
            console.error("Error al obtener carrito:", err);
        }
    };

    useEffect(() => {
        if (activeSection === "Productos") {
            fetchProducts();
        } else if (activeSection === "Carritos") {
            fetchCart();
        }
    }, [activeSection]);

    const addToCart = async (productId: number) => {
        if (!token) return navigate("/");

        try {
            await axios.post(
                "http://127.0.0.1:8000/cart/add",
                { product_id: productId, quantity: quantities[productId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setCartMessage("Producto agregado al carrito");
            fetchCart(); // actualizar carrito en tiempo real
            setTimeout(() => setCartMessage(null), 3000);
        } catch (err: any) {
            console.error("Error al agregar al carrito:", err);
            setCartMessage("Error al agregar el producto ");
            setTimeout(() => setCartMessage(null), 3000);
        }
    };

    const increment = (id: number) => {
        setQuantities((prev) => ({ ...prev, [id]: prev[id] + 1 }));
    };

    const decrement = (id: number) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: prev[id] > 1 ? prev[id] - 1 : 1,
        }));
    };

    const handleInputChange = (id: number, value: number) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: value > 0 ? value : 1,
        }));
    };


    const fetchSavedCarts = async () => {
        if (!token) return navigate("/");

        setLoadingSaved(true);
        try {
            const res = await axios.get("http://127.0.0.1:8000/cart/saved", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSavedCarts(res.data);
        } catch (err) {
            console.error("Error al obtener pedidos:", err);
        } finally {
            setLoadingSaved(false);
        }
    };


    const formatCOP = (value: string | number) => {
        if (!value) return "";
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
        }).format(Number(value));
    };





    return (
        <div className="min-h-screen bg-gray-100">
            {/* HEADER */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="text-indigo-600" />
                        <h1 className="text-xl font-bold text-gray-800">
                            Merca YA!
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <User size={18} />
                            <span className="text-sm">Bienvenido</span>
                        </div>

                        <button
                            onClick={logout}
                            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition"
                        >
                            <LogOut size={18} />
                            Salir
                        </button>
                    </div>
                </div>
            </header>

            {/* CONTENIDO */}
            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* PANEL PRINCIPAL */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-lg p-8 mb-6"
                >
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        🛒 Panel principal
                    </h2>

                    <p className="text-gray-500 mb-6">
                        Selecciona una sección de tu tienda virtual
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {["Productos", "Carritos", "Pedidos", "Items"].map((item) => (
                            <motion.div
                                key={item}
                                onClick={() => {
                                    setActiveSection(item);
                                    if (item === "Pedidos") fetchSavedCarts();
                                }}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`rounded-xl border p-6 cursor-pointer hover:shadow-md transition ${activeSection === item
                                    ? "bg-indigo-50 border-indigo-400"
                                    : "bg-gray-50"
                                    }`}
                            >
                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                    {item}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Accede a la sección de {item.toLowerCase()}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* MENSAJE DE CARRITO */}
                {cartMessage && (
                    <div className="mb-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                        <Check size={20} /> {cartMessage}
                    </div>
                )}

                {/* SECCION PRODUCTOS */}
                {activeSection === "Productos" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-8 mb-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            🛒 Productos
                        </h2>

                        {loading ? (
                            <p className="text-gray-500">Cargando productos...</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {products.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="rounded-xl border bg-gray-50 p-6 hover:shadow-md transition"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            {product.name}
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            ${product.price.toLocaleString()}
                                        </p>

                                        {/* INPUT DE CANTIDAD */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <button
                                                onClick={() => decrement(product.id)}
                                                className="px-2 py-1 bg-gray-200 rounded"
                                            >
                                                -
                                            </button>
                                            <input
                                                type="number"
                                                value={quantities[product.id] || 1}
                                                min={1}
                                                onChange={(e) =>
                                                    handleInputChange(
                                                        product.id,
                                                        parseInt(e.target.value)
                                                    )
                                                }
                                                className="w-12 text-center border rounded"
                                            />
                                            <button
                                                onClick={() => increment(product.id)}
                                                className="px-2 py-1 bg-gray-200 rounded"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => addToCart(product.id)}
                                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                                        >
                                            Agregar al carrito
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}


                {/* SECCION CARRITOS */}
                {activeSection === "Carritos" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-8 mb-6"
                    >
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            🛒 Mi carrito actual
                        </h1>

                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Total: $
                            {cartItems
                                .reduce(
                                    (sum, item) => sum + (item.subtotal || item.price * item.quantity),
                                    0
                                )
                                .toLocaleString()}
                        </h2>



                        {cartItems.length === 0 ? (
                            <p className="text-gray-500">No hay productos en el carrito.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.product_id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="rounded-xl border bg-gray-50 p-6 hover:shadow-md transition"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                                {item.name}
                                            </h3>
                                            <p className="text-gray-600 mb-2">
                                                ${item.price.toLocaleString()}
                                            </p>

                                            {/* Cantidad editable */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <button
                                                    onClick={async () => {
                                                        if (item.quantity > 1) {
                                                            const newQty = item.quantity - 1;
                                                            await axios.put(
                                                                `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                                { quantity: newQty },
                                                                { headers: { Authorization: `Bearer ${token}` } }
                                                            );
                                                            fetchCart();
                                                        }
                                                    }}
                                                    className="px-2 py-1 bg-gray-200 rounded"
                                                >
                                                    -
                                                </button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={async (e) => {
                                                        const newQty = parseInt(e.target.value) || 1;
                                                        await axios.put(
                                                            `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                            { quantity: newQty },
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        fetchCart();
                                                    }}
                                                    className="w-12 text-center border rounded"
                                                />
                                                <button
                                                    onClick={async () => {
                                                        const newQty = item.quantity + 1;
                                                        await axios.put(
                                                            `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                            { quantity: newQty },
                                                            { headers: { Authorization: `Bearer ${token}` } }
                                                        );
                                                        fetchCart();
                                                    }}
                                                    className="px-2 py-1 bg-gray-200 rounded"
                                                >
                                                    +
                                                </button>
                                            </div>



                                            <button
                                                onClick={async () => {
                                                    await axios.delete(
                                                        `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                        { headers: { Authorization: `Bearer ${token}` } }
                                                    );
                                                    fetchCart();
                                                }}
                                                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition"
                                            >
                                                Eliminar
                                            </button>

                                            <p className="text-gray-800 font-semibold mt-2">
                                                Subtotal: ${(item.subtotal || item.price * item.quantity).toLocaleString()}
                                            </p>

                                        </motion.div>

                                    ))}
                                </div>

                                {/* BOTON REALIZAR COMPRA */}
                                <div className="mt-6 flex justify-end">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await axios.post(
                                                    "http://127.0.0.1:8000/cart/save",
                                                    {},
                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                );
                                                setCartMessage(`Compra realizada con #id: ${res.data.cart_id}`);
                                                setCartItems([]);
                                                setTimeout(() => setCartMessage(null), 4000);
                                            } catch (err) {
                                                console.error("Error al realizar la compra:", err);
                                                setCartMessage("Error al realizar la compra ");
                                                setTimeout(() => setCartMessage(null), 4000);
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition"
                                    >
                                        Realizar Compra
                                    </button>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}



                {/* SECCION PEDIDOS */}
                {activeSection === "Pedidos" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="bg-white rounded-2xl shadow-lg p-8 mb-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            📦 Pedidos realizados
                        </h2>

                        {loadingSaved ? (
                            <p className="text-gray-500">Cargando pedidos...</p>
                        ) : savedCarts.length === 0 ? (
                            <p className="text-gray-500">No hay pedidos guardados.</p>
                        ) : (
                            <div className="space-y-6">
                                {savedCarts.map((cart) => (
                                    <motion.div
                                        key={cart.cart_id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="rounded-xl border bg-gray-50 p-6 hover:shadow-md transition"
                                    >
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                            Carrito #{cart.cart_id} - {cart.purchased_at ? new Date(cart.purchased_at).toLocaleString() : "Fecha desconocida"}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {cart.items.map((item: CartItem) => (
                                                <div key={item.item_id} className="bg-white p-4 rounded-lg shadow-sm">
                                                    <h4 className="font-medium text-gray-800">{item.product_name}</h4>
                                                    <p className="text-gray-600">Precio: ${item.price.toLocaleString()}</p>
                                                    <p className="text-gray-600">Cantidad: {item.quantity}</p>
                                                    <p className="font-semibold text-gray-800">Subtotal: ${(item.price * item.quantity).toLocaleString()}</p>
                                                </div>
                                            ))}
                                        </div>

                                        <p className="mt-4 text-right font-bold text-gray-800">
                                            Total: ${cart.total.toLocaleString()}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}


                {/* SECCION ITEMS */}
                {activeSection === "Items" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex justify-center"
                    >
                        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                            {/* HEADER */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-indigo-100 rounded-xl">
                                    <ShoppingBag className="text-indigo-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">
                                        Nuevo producto
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        Agrega productos al catálogo
                                    </p>
                                </div>
                            </div>

                            {/* MENSAJE */}
                            {itemMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mb-5 p-4 rounded-lg text-sm font-medium ${itemMessage.includes("éxito")
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                        }`}
                                >
                                    {itemMessage}
                                </motion.div>
                            )}

                            {/* FORM */}
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    if (!token) return navigate("/");

                                    try {
                                        await axios.post(
                                            "http://127.0.0.1:8000/products",
                                            {
                                                name: itemName,
                                                price: Number(itemPrice),
                                            },
                                            { headers: { Authorization: `Bearer ${token}` } }
                                        );
                                        setItemMessage("Producto agregado con éxito");
                                        setItemName("");
                                        setItemPrice("");
                                        setTimeout(() => setItemMessage(null), 3000);
                                    } catch (err) {
                                        console.error(err);
                                        setItemMessage("Error al agregar el producto");
                                        setTimeout(() => setItemMessage(null), 3000);
                                    }
                                }}
                                className="space-y-5"
                            >
                                {/* INPUT NOMBRE */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Nombre del producto
                                    </label>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="Ej: Monitor"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* INPUT PRECIO */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                                        Precio
                                    </label>

                                    <input
                                        type="text"
                                        value={itemPriceDisplay}
                                        onChange={(e) => {
                                            // quitar todo lo que no sea número
                                            const rawValue = e.target.value.replace(/\D/g, "");

                                            setItemPrice(rawValue ? Number(rawValue) : "");
                                            setItemPriceDisplay(rawValue ? formatCOP(rawValue) : "");
                                        }}
                                        placeholder="$70.000"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                   focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>


                                {/* BOTON */}
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition cursor-pointer"
                                >
                                    <Check size={18} />
                                    Guardar producto
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}



            </main>
        </div>
    );
}
