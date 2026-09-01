/**
 * principal.js
 * Punto de entrada de la aplicación: conecta los datos y el carrito con
 * el DOM. Maneja el renderizado del catálogo, los filtros, la búsqueda,
 * el panel del carrito y el flujo completo de checkout.
 */

// ---------- Referencias al DOM ----------

const campoBusqueda = document.getElementById("campo-busqueda");
const filtrosCategoria = document.getElementById("filtros-categoria");
const grillaProductos = document.getElementById("grilla-productos");
const mensajeSinResultados = document.getElementById("mensaje-sin-resultados");
const textoResultados = document.getElementById("texto-resultados");

const botonCarrito = document.getElementById("boton-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const panelCarrito = document.getElementById("panel-carrito");
const fondoPanel = document.getElementById("fondo-panel");
const cerrarCarritoBtn = document.getElementById("cerrar-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const carritoVacioMsg = document.getElementById("carrito-vacio");
const resumenCarrito = document.getElementById("resumen-carrito");
const valorSubtotal = document.getElementById("valor-subtotal");
const valorImpuestos = document.getElementById("valor-impuestos");
const valorTotal = document.getElementById("valor-total");
const botonPagar = document.getElementById("boton-pagar");

const modalCheckout = document.getElementById("modal-checkout");
const cerrarCheckoutBtn = document.getElementById("cerrar-checkout");
const formularioCheckout = document.getElementById("formulario-checkout");
const resumenPedidoModal = document.getElementById("resumen-pedido-modal");
const metodoPagoSelect = document.getElementById("metodo-pago");
const camposTarjeta = document.getElementById("campos-tarjeta");
const numeroTarjetaInput = document.getElementById("numero-tarjeta");
const vencimientoTarjetaInput = document.getElementById("vencimiento-tarjeta");

const modalConfirmacion = document.getElementById("modal-confirmacion");
const numeroOrdenSpan = document.getElementById("numero-orden");
const detalleConfirmacion = document.getElementById("detalle-confirmacion");
const cerrarConfirmacionBtn = document.getElementById("cerrar-confirmacion");

// ---------- Estado de filtros ----------

let categoriaActiva = "Todas";
let terminoBusqueda = "";

// ---------- Renderizado del catálogo ----------

/** Filtra el catálogo según la categoría activa y el término de búsqueda. */
function obtenerProductosFiltrados() {
  return catalogoProductos.filter((producto) => {
    const coincideCategoria =
      categoriaActiva === "Todas" || producto.categoria === categoriaActiva;

    const textoCompleto = [
      producto.nombre,
      producto.tipo,
      producto.procesador,
      producto.ram,
      producto.almacenamiento,
      producto.tarjetaGrafica,
    ]
      .join(" ")
      .toLowerCase();

    const coincideBusqueda = textoCompleto.includes(terminoBusqueda.toLowerCase());

    return coincideCategoria && coincideBusqueda;
  });
}

/** Construye el marcado HTML de una tarjeta de producto. */
function crearTarjetaProducto(producto) {
  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta-producto";

  tarjeta.innerHTML = `
    <div class="tarjeta-producto__imagen-cont">
      <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy" />
      <span class="tarjeta-producto__categoria">${producto.categoria}</span>
    </div>
    <div class="tarjeta-producto__cuerpo">
      <h3 class="tarjeta-producto__nombre">${producto.nombre}</h3>
      <p class="tarjeta-producto__tipo">${producto.tipo}</p>

      <div class="especificaciones">
        <div class="especificaciones__item">
          <span class="especificaciones__etiqueta">PROCESADOR</span>
          <span class="especificaciones__valor">${producto.procesador}</span>
        </div>
        <div class="especificaciones__item">
          <span class="especificaciones__etiqueta">RAM</span>
          <span class="especificaciones__valor">${producto.ram}</span>
        </div>
        <div class="especificaciones__item">
          <span class="especificaciones__etiqueta">ALMACENAMIENTO</span>
          <span class="especificaciones__valor">${producto.almacenamiento}</span>
        </div>
        <div class="especificaciones__item">
          <span class="especificaciones__etiqueta">GRÁFICOS</span>
          <span class="especificaciones__valor">${producto.tarjetaGrafica}</span>
        </div>
      </div>

      <div class="tarjeta-producto__pie">
        <span class="tarjeta-producto__precio">${formatearMoneda(producto.precio)}</span>
        <button class="boton-agregar" data-id="${producto.id}">Agregar</button>
      </div>
    </div>
  `;

  return tarjeta;
}

/** Vuelve a dibujar la grilla de productos según los filtros actuales. */
function renderizarCatalogo() {
  const productosFiltrados = obtenerProductosFiltrados();

  grillaProductos.innerHTML = "";

  if (productosFiltrados.length === 0) {
    mensajeSinResultados.classList.remove("oculto");
  } else {
    mensajeSinResultados.classList.add("oculto");
    productosFiltrados.forEach((producto) => {
      grillaProductos.appendChild(crearTarjetaProducto(producto));
    });
  }

  const totalCatalogo = catalogoProductos.length;
  textoResultados.textContent =
    productosFiltrados.length === totalCatalogo
      ? `Mostrando ${totalCatalogo} equipos`
      : `Mostrando ${productosFiltrados.length} de ${totalCatalogo} equipos`;
}

// ---------- Eventos de filtro y búsqueda ----------

filtrosCategoria.addEventListener("click", (evento) => {
  const chip = evento.target.closest(".chip");
  if (!chip) return;

  filtrosCategoria
    .querySelectorAll(".chip")
    .forEach((elemento) => elemento.classList.remove("chip--activo"));
  chip.classList.add("chip--activo");

  categoriaActiva = chip.dataset.categoria;
  renderizarCatalogo();
});

campoBusqueda.addEventListener("input", (evento) => {
  terminoBusqueda = evento.target.value.trim();
  renderizarCatalogo();
});

// Delegación de eventos: agregar producto al carrito desde cualquier tarjeta
grillaProductos.addEventListener("click", (evento) => {
  const boton = evento.target.closest(".boton-agregar");
  if (!boton) return;

  const idProducto = Number(boton.dataset.id);
  const producto = catalogoProductos.find((p) => p.id === idProducto);
  if (!producto) return;

  agregarAlCarrito(producto, 1);
  renderizarCarrito();

  // Pequeña confirmación visual en el botón
  const textoOriginal = boton.textContent;
  boton.textContent = "Agregado ✓";
  boton.disabled = true;
  setTimeout(() => {
    boton.textContent = textoOriginal;
    boton.disabled = false;
  }, 700);
});

// ---------- Renderizado y control del panel del carrito ----------

function crearItemCarrito(item) {
  const { producto, cantidad } = item;
  const elemento = document.createElement("div");
  elemento.className = "item-carrito";

  elemento.innerHTML = `
    <img src="${producto.imagen}" alt="${producto.nombre}" />
    <div>
      <p class="item-carrito__nombre">${producto.nombre}</p>
      <span class="item-carrito__precio">${formatearMoneda(producto.precio)} c/u</span>
      <div class="item-carrito__controles">
        <button class="item-carrito__cantidad-btn" data-accion="restar" data-id="${producto.id}" aria-label="Restar unidad">−</button>
        <span class="item-carrito__cantidad-valor">${cantidad}</span>
        <button class="item-carrito__cantidad-btn" data-accion="sumar" data-id="${producto.id}" aria-label="Sumar unidad">+</button>
      </div>
    </div>
    <div class="item-carrito__acciones">
      <span class="item-carrito__subtotal">${formatearMoneda(producto.precio * cantidad)}</span>
      <button class="item-carrito__eliminar" data-accion="eliminar" data-id="${producto.id}">Eliminar</button>
    </div>
  `;

  return elemento;
}

function renderizarCarrito() {
  listaCarrito.innerHTML = "";

  const hayItems = itemsCarrito.length > 0;
  carritoVacioMsg.classList.toggle("oculto", hayItems);
  resumenCarrito.classList.toggle("oculto", !hayItems);

  itemsCarrito.forEach((item) => {
    listaCarrito.appendChild(crearItemCarrito(item));
  });

  const { subtotal, impuestos, total } = calcularResumenCarrito();
  valorSubtotal.textContent = formatearMoneda(subtotal);
  valorImpuestos.textContent = formatearMoneda(impuestos);
  valorTotal.textContent = formatearMoneda(total);

  contadorCarrito.textContent = contarUnidadesCarrito();
  botonPagar.disabled = !hayItems;
}

listaCarrito.addEventListener("click", (evento) => {
  const boton = evento.target.closest("button[data-accion]");
  if (!boton) return;

  const idProducto = Number(boton.dataset.id);
  const item = itemsCarrito.find((i) => i.producto.id === idProducto);
  if (!item) return;

  switch (boton.dataset.accion) {
    case "sumar":
      actualizarCantidad(idProducto, item.cantidad + 1);
      break;
    case "restar":
      actualizarCantidad(idProducto, item.cantidad - 1);
      break;
    case "eliminar":
      eliminarDelCarrito(idProducto);
      break;
  }

  renderizarCarrito();
});

function abrirPanelCarrito() {
  panelCarrito.classList.add("panel-carrito--abierto");
  fondoPanel.classList.remove("oculto");
}

function cerrarPanelCarrito() {
  panelCarrito.classList.remove("panel-carrito--abierto");
  fondoPanel.classList.add("oculto");
}

botonCarrito.addEventListener("click", abrirPanelCarrito);
cerrarCarritoBtn.addEventListener("click", cerrarPanelCarrito);
fondoPanel.addEventListener("click", () => {
  cerrarPanelCarrito();
  cerrarModal(modalCheckout);
  cerrarModal(modalConfirmacion);
});

// ---------- Checkout ----------

function abrirModal(modal) {
  modal.classList.remove("oculto");
}

function cerrarModal(modal) {
  modal.classList.add("oculto");
}

function renderizarResumenPedido(contenedor) {
  const { subtotal, impuestos, total } = calcularResumenCarrito();

  const filasProductos = itemsCarrito
    .map(
      (item) => `
        <div class="linea-resumen-pedido">
          <span>${item.cantidad} × ${item.producto.nombre}</span>
          <span>${formatearMoneda(item.producto.precio * item.cantidad)}</span>
        </div>`
    )
    .join("");

  contenedor.innerHTML = `
    <h3>Resumen del pedido</h3>
    ${filasProductos}
    <div class="linea-resumen-pedido">
      <span>Subtotal</span>
      <span>${formatearMoneda(subtotal)}</span>
    </div>
    <div class="linea-resumen-pedido">
      <span>Impuestos (16%)</span>
      <span>${formatearMoneda(impuestos)}</span>
    </div>
    <div class="linea-resumen-pedido linea-resumen-pedido--total">
      <span>Total</span>
      <span>${formatearMoneda(total)}</span>
    </div>
  `;
}

botonPagar.addEventListener("click", () => {
  if (itemsCarrito.length === 0) return;
  cerrarPanelCarrito();
  renderizarResumenPedido(resumenPedidoModal);
  abrirModal(modalCheckout);
});

cerrarCheckoutBtn.addEventListener("click", () => cerrarModal(modalCheckout));

// Mostrar u ocultar los campos de tarjeta según el método de pago elegido
metodoPagoSelect.addEventListener("change", () => {
  const requiereTarjeta = ["Tarjeta de crédito", "Tarjeta de débito"].includes(
    metodoPagoSelect.value
  );
  camposTarjeta.classList.toggle("oculto", !requiereTarjeta);
  numeroTarjetaInput.required = requiereTarjeta;
  vencimientoTarjetaInput.required = requiereTarjeta;
});

// Formateo simple del número de tarjeta mientras se escribe (0000 0000 0000 0000)
numeroTarjetaInput.addEventListener("input", () => {
  const soloDigitos = numeroTarjetaInput.value.replace(/\D/g, "").slice(0, 16);
  numeroTarjetaInput.value = soloDigitos.replace(/(.{4})/g, "$1 ").trim();
});

// Formateo simple del vencimiento (MM/AA)
vencimientoTarjetaInput.addEventListener("input", () => {
  let valor = vencimientoTarjetaInput.value.replace(/\D/g, "").slice(0, 4);
  if (valor.length > 2) {
    valor = `${valor.slice(0, 2)}/${valor.slice(2)}`;
  }
  vencimientoTarjetaInput.value = valor;
});

formularioCheckout.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const datosPedido = {
    nombre: document.getElementById("nombre-cliente").value,
    correo: document.getElementById("correo-cliente").value,
    telefono: document.getElementById("telefono-cliente").value,
    direccion: document.getElementById("direccion-envio").value,
    ciudad: document.getElementById("ciudad-envio").value,
    codigoPostal: document.getElementById("codigo-postal").value,
    metodoPago: metodoPagoSelect.value,
  };

  const numeroOrden = generarNumeroOrden();
  const { subtotal, impuestos, total } = calcularResumenCarrito();
  const cantidadUnidades = contarUnidadesCarrito();

  numeroOrdenSpan.textContent = numeroOrden;

  detalleConfirmacion.innerHTML = `
    <div class="confirmacion__detalle-linea">
      <span>Cliente</span>
      <span>${datosPedido.nombre}</span>
    </div>
    <div class="confirmacion__detalle-linea">
      <span>Envío a</span>
      <span>${datosPedido.direccion}, ${datosPedido.ciudad}</span>
    </div>
    <div class="confirmacion__detalle-linea">
      <span>Método de pago</span>
      <span>${datosPedido.metodoPago}</span>
    </div>
    <div class="confirmacion__detalle-linea">
      <span>Unidades</span>
      <span>${cantidadUnidades}</span>
    </div>
    <div class="confirmacion__detalle-linea">
      <span>Subtotal</span>
      <span>${formatearMoneda(subtotal)}</span>
    </div>
    <div class="confirmacion__detalle-linea">
      <span>Impuestos</span>
      <span>${formatearMoneda(impuestos)}</span>
    </div>
    <div class="confirmacion__detalle-linea">
      <span>Total pagado</span>
      <span><strong>${formatearMoneda(total)}</strong></span>
    </div>
  `;

  // Cerrar checkout, limpiar carrito y formulario, mostrar confirmación
  cerrarModal(modalCheckout);
  vaciarCarrito();
  renderizarCarrito();
  formularioCheckout.reset();
  camposTarjeta.classList.add("oculto");
  abrirModal(modalConfirmacion);
});

cerrarConfirmacionBtn.addEventListener("click", () => {
  cerrarModal(modalConfirmacion);
});

// Cerrar modales con la tecla Escape
document.addEventListener("keydown", (evento) => {
  if (evento.key !== "Escape") return;
  cerrarPanelCarrito();
  cerrarModal(modalCheckout);
  cerrarModal(modalConfirmacion);
});

// ---------- Inicialización ----------

renderizarCatalogo();
renderizarCarrito();
