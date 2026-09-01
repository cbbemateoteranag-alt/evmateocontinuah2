/**
 * carrito.js
 * Contiene toda la lógica de estado y cálculo del carrito de compras.
 * No manipula el DOM directamente: expone funciones puras y un array
 * de estado que principal.js se encarga de renderizar.
 */

const TASA_IMPUESTO = 0.16; // 16% de impuestos, ajustable según la región

let itemsCarrito = []; // [{ producto, cantidad }]

/** Agrega un producto al carrito. Si ya existe, incrementa la cantidad. */
function agregarAlCarrito(producto, cantidad = 1) {
  const itemExistente = itemsCarrito.find((item) => item.producto.id === producto.id);

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    itemsCarrito.push({ producto, cantidad });
  }
}

/** Elimina por completo un producto del carrito. */
function eliminarDelCarrito(idProducto) {
  itemsCarrito = itemsCarrito.filter((item) => item.producto.id !== idProducto);
}

/** Cambia la cantidad de un producto ya presente en el carrito. */
function actualizarCantidad(idProducto, nuevaCantidad) {
  const item = itemsCarrito.find((item) => item.producto.id === idProducto);
  if (!item) return;

  if (nuevaCantidad <= 0) {
    eliminarDelCarrito(idProducto);
    return;
  }
  item.cantidad = nuevaCantidad;
}

/** Vacía completamente el carrito (se usa tras confirmar un pedido). */
function vaciarCarrito() {
  itemsCarrito = [];
}

/** Devuelve la cantidad total de unidades en el carrito. */
function contarUnidadesCarrito() {
  return itemsCarrito.reduce((total, item) => total + item.cantidad, 0);
}

/** Calcula subtotal, impuestos y total del carrito actual. */
function calcularResumenCarrito() {
  const subtotal = itemsCarrito.reduce(
    (total, item) => total + item.producto.precio * item.cantidad,
    0
  );
  const impuestos = subtotal * TASA_IMPUESTO;
  const total = subtotal + impuestos;

  return { subtotal, impuestos, total };
}

/** Genera un número de orden ficticio con formato BF-XXXXXX. */
function generarNumeroOrden() {
  const numeroAleatorio = Math.floor(100000 + Math.random() * 900000);
  return `BF-${numeroAleatorio}`;
}

/** Da formato de moneda en bolivianos (Bs) a un número, con separador de miles. */
function formatearMoneda(valor) {
  const valorFormateado = valor.toLocaleString("es-BO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Bs ${valorFormateado}`;
}
