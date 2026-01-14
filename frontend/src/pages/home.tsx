import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, LogOut, User, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export interface SavedCartItem {
    item_id: number
    product_id: number
    product_name: string
    price: number
    quantity: number
    subtotal: number
    image: string | null
}

export interface SavedCart {
    cart_id: number
    purchased_at: string
    items: SavedCartItem[]
    total: number
}




export default function Home() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState<string | null>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [cartMessage, setCartMessage] = useState<string | null>(null);
    const [quantities, setQuantities] = useState<Record<number, number>>({});

    const [savedCarts, setSavedCarts] = useState<SavedCart[]>([])
    const [loadingSaved, setLoadingSaved] = useState(false);

    const [itemName, setItemName] = useState("");

    const [itemMessage, setItemMessage] = useState<string | null>(null);

    const [itemPrice, setItemPrice] = useState<number | "">("");
    const [itemPriceDisplay, setItemPriceDisplay] = useState("");

    const [itemImage, setItemImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);



    const token = localStorage.getItem("token");
    //console.log(token);

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



    const Restar = () => {
        setCartItems((prevItems) =>
            prevItems.map((item) => {
                const newQty = item.quantity > 1 ? item.quantity - 1 : 1;

                return {
                    ...item,
                    quantity: newQty,
                    subtotal: item.price * newQty,
                };
            })
        );
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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
                            🛒 Productos
                        </h2>

                        {loading ? (
                            <p className="text-gray-500">Cargando productos...</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {products.map((product, index) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="rounded-2xl border bg-white overflow-hidden
                                   hover:shadow-xl transition flex flex-col"
                                    >
                                        {/* IMAGEN */}
                                        <div className="h-44 bg-gray-100 overflow-hidden">
                                            <img
                                                src={
                                                    product.image
                                                        ? product.image.startsWith("http")
                                                            ? product.image
                                                            : `http://127.0.0.1:8000/${product.image}`
                                                        : "/placeholder.png"
                                                }
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src =
                                                        "/placeholder.png";
                                                }}
                                            />
                                        </div>

                                        {/* CONTENIDO */}
                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                {product.name}
                                            </h3>

                                            <p className="text-indigo-600 font-bold mb-4">
                                                {formatCOP(product.price)}
                                            </p>

                                            {/* CANTIDAD */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <button
                                                    onClick={() => decrement(product.id)}
                                                    className="px-3 py-1 bg-gray-200 rounded-lg
                                               hover:bg-gray-300 transition"
                                                >
                                                    −
                                                </button>

                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={quantities[product.id] || 1}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            product.id,
                                                            parseInt(e.target.value)
                                                        )
                                                    }
                                                    className="w-12 text-center border rounded-lg"
                                                />

                                                <button
                                                    onClick={() => increment(product.id)}
                                                    className="px-3 py-1 bg-gray-200 rounded-lg
                                               hover:bg-gray-300 transition"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* BOTON */}
                                            <button
                                                onClick={() => addToCart(product.id)}
                                                className="mt-auto w-full bg-indigo-600
                                           hover:bg-indigo-700 text-white
                                           py-2.5 rounded-xl transition
                                           font-semibold"
                                            >
                                                Agregar al carrito
                                            </button>
                                        </div>
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
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            🛒 Mi carrito actual
                        </h1>

                        <h2 className="text-xl font-bold text-indigo-600 mb-6">
                            Total:{" "}
                            {formatCOP(
                                cartItems.reduce(
                                    (sum, item) =>
                                        sum + (item.subtotal || item.price * item.quantity),
                                    0
                                )
                            )}
                        </h2>

                        {cartItems.length === 0 ? (
                            <p className="text-gray-500">No hay productos en el carrito.</p>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.item_id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="rounded-2xl border bg-white overflow-hidden hover:shadow-lg transition flex flex-col"
                                        >
                                            {/* IMAGEN */}
                                            <div className="h-36 bg-gray-100 overflow-hidden">
                                                <img
                                                    src={
                                                        item.image
                                                            ? item.image.startsWith("http")
                                                                ? item.image
                                                                : `http://127.0.0.1:8000/${item.image}`
                                                            : "/placeholder.png"
                                                    }
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src =
                                                            "/placeholder.png";
                                                    }}
                                                />
                                            </div>

                                            {/* CONTENIDO */}
                                            <div className="p-5 flex flex-col flex-1">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                    {item.name}
                                                </h3>

                                                <p className="text-gray-600 mb-3">
                                                    {formatCOP(item.price)}
                                                </p>

                                                {/* CANTIDAD */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <button
                                                        onClick={async () => {
                                                            if (item.quantity > 1) {
                                                                const newQty = item.quantity - 1;
                                                                await axios.put(
                                                                    `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                                    { quantity: newQty },
                                                                    {
                                                                        headers: {
                                                                            Authorization: `Bearer ${token}`,
                                                                        },
                                                                    }
                                                                );
                                                                fetchCart();
                                                            }
                                                        }}
                                                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                                    >
                                                        −
                                                    </button>

                                                    <input
                                                        type="number"
                                                        min={1}
                                                        value={item.quantity}
                                                        onChange={async (e) => {
                                                            const newQty =
                                                                parseInt(e.target.value) || 1;
                                                            await axios.put(
                                                                `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                                { quantity: newQty },
                                                                {
                                                                    headers: {
                                                                        Authorization: `Bearer ${token}`,
                                                                    },
                                                                }
                                                            );
                                                            fetchCart();
                                                        }}
                                                        className="w-12 text-center border rounded-lg"
                                                    />

                                                    <button
                                                        onClick={async () => {
                                                            const newQty = item.quantity + 1;
                                                            await axios.put(
                                                                `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                                { quantity: newQty },
                                                                {
                                                                    headers: {
                                                                        Authorization: `Bearer ${token}`,
                                                                    },
                                                                }
                                                            );
                                                            fetchCart();
                                                        }}
                                                        className="px-3 py-1 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                                                    >
                                                        +
                                                    </button>
                                                </div>

                                                {/* SUBTOTAL */}
                                                <p className="text-gray-800 font-semibold mb-4">
                                                    Subtotal:{" "}
                                                    {formatCOP(
                                                        item.subtotal ||
                                                        item.price * item.quantity
                                                    )}
                                                </p>

                                                {/* BOTON ELIMINAR */}
                                                <button
                                                    onClick={async () => {
                                                        await axios.delete(
                                                            `http://127.0.0.1:8000/cart/item/${item.item_id}`,
                                                            {
                                                                headers: {
                                                                    Authorization: `Bearer ${token}`,
                                                                },
                                                            }
                                                        );
                                                        fetchCart();
                                                    }}
                                                    className="mt-auto w-full bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl transition font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* BOTON REALIZAR COMPRA */}
                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const res = await axios.post(
                                                    "http://127.0.0.1:8000/cart/save",
                                                    {},
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );
                                                setCartMessage(
                                                    `Compra realizada con #id: ${res.data.cart_id}`
                                                );
                                                setCartItems([]);
                                                setTimeout(
                                                    () => setCartMessage(null),
                                                    4000
                                                );
                                            } catch (err) {
                                                console.error(err);
                                                setCartMessage(
                                                    "Error al realizar la compra"
                                                );
                                                setTimeout(
                                                    () => setCartMessage(null),
                                                    4000
                                                );
                                            }
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                                    >
                                        Realizar compra
                                    </button>
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button

                                        onClick={Restar}
                                        className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                                    >
                                        Restar

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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">
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
                                        {/* HEADER */}
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Carrito #{cart.cart_id}
                                            </h3>
                                            <span className="text-sm text-gray-500">
                                                {cart.purchased_at
                                                    ? new Date(cart.purchased_at).toLocaleString("es-CO")
                                                    : "Fecha desconocida"}
                                            </span>
                                        </div>

                                        {/* ITEMS */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {cart.items.map((item) => (
                                                <div
                                                    key={item.item_id}
                                                    className="bg-white p-4 rounded-xl shadow-sm flex gap-4"
                                                >
                                                    {/* IMAGEN */}
                                                    <img
                                                        src={
                                                            item.image
                                                                ? `http://127.0.0.1:8000/${item.image}`
                                                                : "/placeholder.png"
                                                        }
                                                        alt={item.product_name}
                                                        className="w-24 h-24 object-cover rounded-lg border bg-gray-100"
                                                    />

                                                    {/* INFO */}
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800">
                                                            {item.product_name}
                                                        </h4>

                                                        <p className="text-gray-600">
                                                            Precio: $
                                                            {item.price.toLocaleString("es-CO")}
                                                        </p>

                                                        <p className="text-gray-600">
                                                            Cantidad: {item.quantity}
                                                        </p>

                                                        <p className="font-semibold text-gray-800">
                                                            Subtotal: $
                                                            {item.subtotal.toLocaleString("es-CO")}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* TOTAL */}
                                        <p className="mt-4 text-right font-bold text-gray-800 text-lg">
                                            Total: ${cart.total.toLocaleString("es-CO")}
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
                                        const formData = new FormData();
                                        formData.append("name", itemName);
                                        formData.append("price", String(itemPrice));

                                        if (itemImage) {
                                            formData.append("image", itemImage);
                                        }

                                        await axios.post(
                                            "http://127.0.0.1:8000/products/",
                                            formData,
                                            {
                                                headers: {
                                                    Authorization: `Bearer ${token}`,

                                                },
                                            }
                                        );

                                        setItemMessage("Producto agregado con éxito");
                                        setItemName("");
                                        setItemPrice("");
                                        setItemImage(null);
                                        setImagePreview(null);

                                        setTimeout(() => setItemMessage(null), 3000);
                                    } catch (err) {
                                        console.error(err);
                                        setItemMessage("Error al agregar el producto");
                                        setTimeout(() => setItemMessage(null), 3000);
                                    }
                                }}
                                className="space-y-6"
                            >
                                {/* INPUT NOMBRE */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Nombre del producto
                                    </label>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={(e) => setItemName(e.target.value)}
                                        placeholder="Ej: Monitor"
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300
                       focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                        required
                                    />
                                </div>

                                {/* INPUT PRECIO */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-semibold text-gray-700">
                                        Precio
                                    </label>
                                    <input
                                        type="text"
                                        value={itemPriceDisplay}
                                        onChange={(e) => {
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

                                {/* IMAGEN */}
                                <div className="flex flex-col gap-3">
                                    <label className="text-sm font-semibold text-gray-700 text-center">
                                        Imagen del producto
                                    </label>

                                    <div className="flex flex-col items-center gap-4">
                                        {/* PREVIEW */}
                                        <div className="w-28 h-28 rounded-2xl border bg-gray-50 overflow-hidden flex items-center justify-center">
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-xs text-gray-400 text-center px-3">
                                                    Sin imagen
                                                </span>
                                            )}
                                        </div>

                                        {/* INPUT FILE */}
                                        <label className="cursor-pointer">
                                            <span className="px-5 py-2.5 bg-indigo-100 text-indigo-700
                                 rounded-lg font-medium text-sm
                                 hover:bg-indigo-200 transition">
                                                Seleccionar imagen
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                hidden
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setItemImage(file);
                                                        setImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>

                                {/* BOTON */}
                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2
                   bg-indigo-600 hover:bg-indigo-700 text-white
                   font-semibold py-3 rounded-xl transition cursor-pointer"
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
