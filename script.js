const burguerBtn = document.getElementById("toggleNavBtn"); //menu hamburguesa para mostrar u ocultar la navegacion
const navBar = document.getElementById("navBar"); //lista desordenada que se muestra u oculta
const links = document.getElementsByClassName("nav-item__link"); //links del menu de navegación
const loadBar = document.getElementById("loadBar"); //barra que muestra el avance del scroll de la página
const arrowUp = document.getElementById("arrowUp"); //boton que se muestra en la parte inferior para hacer scroll top 0
const form = document.getElementById("form"); //formulario de contacto
const termsBox = document.getElementById("terms"); //input checkout del formulario de contacto
const submitBtn = document.getElementById("submit"); //input submit del formulario de contacto
const modal = document.getElementById("modal"); //ventana modal que aparece tipo push
const modalContent = document.getElementById("modalContent"); //ventana interior a la modal, muestra el contenido
const modalCloseBtn = document.getElementById("modalCloseBtn"); //boton para cerral la ventana modal
let showModal = JSON.parse(localStorage.getItem("showModal")) ?? true; //variable para decidir si mostrar o no la ventana modal
const prices = document.getElementsByClassName("priceValue"); //Valores de los planes de la sección "prices"
const currents = document.getElementsByClassName("current"); //Opciones de unidades monetarias

let usdFactor; //Factor de conversión de euro a dolar
let gbpFactor; //Factor de conversión de euro a libra

//Función asíncrona para realizar una petición y setear los valores de conversión de monedas actual
async function getCurrenFactor() {
  const response = await fetch(
    "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/eur.json"
  );
  const data = await response.json();
  usdFactor = data.eur.usd;
  gbpFactor = data.eur.gbp;
}
getCurrenFactor();

//Evento click sobre el menú hamburguesa. Oculta o muestra la navegación
burguerBtn.addEventListener("click", () => {
  navBar.classList.toggle("show");
  burguerBtn.classList.toggle("changeBtn");
});

//Asigno eventos para que, cuando se este con una resolucion menor a 1000px, el menu se esconda al clicker sobre un link
for (let i = 0; i < links.length; i++) {
  links[i].addEventListener("click", () => {
    const width = window.screen.width;
    if (width < 1000) {
      navBar.classList.toggle("show");
      burguerBtn.classList.toggle("changeBtn");
    } else {
      return;
    }
  });
}

//Evento de scroll. Al cambiar, actualiza el ancho de la barra de scroll de la parte superior de la página
//Dispara ventana modal si no apareció anteriormente
window.addEventListener("scroll", () => {
  const scrollFraction =
    window.scrollY / (document.body.scrollHeight - window.innerHeight);
  loadBar.style.width = `${scrollFraction * 100}%`;
  if (showModal) {
    if (scrollFraction > 0.25) {
      modalBehavior();
    }
  }
});

//Evento click sobre el boton de la parte inferior, para realizar un scroll top 0
arrowUp.addEventListener("click", () => {
  setTimeout(() => {
    window.scroll({
      top: 0,
      behavior: "smooth",
    });
  }, 200);
});

//Evento submit del formulario de contacto. Verifica longitud del nombre, email válido segpun regex y luego "envía" los datos.
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const regEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

  const { name, email } = e.target;
  const valid = regEx.test(email.value);
  if (name.value.length < 2 || name.value.length > 100) {
    name.classList.toggle("alert");
  } else if (!valid) {
    email.classList.toggle("alert");
  } else {
    submitBtn.disabled = true;
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      body: JSON.stringify({
        title: "userData",
        body: { name: name.value, email: email.value },
        userId: `${name.value}-${email.value}`,
      }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
    const jsonData = await response.json();
    console.log(jsonData.body);
    submitBtn.disabled = false;
    termsBox.checked = false;
    name.value = "";
    email.value = "";
  }

  name.addEventListener("click", () => {
    name.classList.remove("alert");
  });
  email.addEventListener("click", () => {
    email.classList.remove("alert");
  });
});

//Evento para habilitar o deshabilitar el formulario al checkear el input
termsBox.addEventListener("change", () => {
  if (termsBox.checked) {
    submitBtn.disabled = false;
  } else {
    submitBtn.disabled = true;
  }
});

//Dispara la ventana modal al cabo de 5 segundos, si no se mostró anteriormente
setTimeout(() => {
  if (showModal) {
    modalBehavior();
  }
}, 5000);

//Función que muestra la ventana modal, asignandole el comportamiento deseado.
function modalBehavior() {
  showModal = false;
  localStorage.setItem("showModal", showModal);
  modal.style.display = "block";
  const formNews = document.getElementById("formNews");
  formNews.addEventListener("submit", async (e) => {
    e.preventDefault();
    const regEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    const { emailNews } = e.target;
    const valid = regEx.test(emailNews.value);
    if (!valid) {
      emailNews.classList.toggle("alert");
    } else {
      emailNews.value = "";
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/posts",
        {
          method: "POST",
          body: JSON.stringify({
            title: "newSubscription",
            body: { email: emailNews.value },
          }),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        }
      );
      const jsonData = await response.json();
      console.log(jsonData.body);
      modal.style.display = "none";
    }

    emailNews.addEventListener("click", () => {
      emailNews.classList.remove("alert");
    });
  });

  //Eventos que mandan a cerrar la ventana modal
  //Click en el boton "close"
  modalCloseBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
  //Presión de la tecla "escape"
  window.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      modal.style.display = "none";
    }
  });
  //Click fuera de la ventana modal de contenido
  modal.addEventListener("click", (e) => {
    if (!modalContent.contains(e.target)) {
      modal.style.display = "none";
    }
  });
}

//Asignando evento para cambiar los valores de la sección precios al cambiar la unidad de la moneda
for (let i = 0; i < currents.length; i++) {
  currents[i].addEventListener("click", () => {
    cleanSelect();
    currents[i].classList.add("selected");
    setPrices(i);
  });
}
//Función que actualiza los precios
function setPrices(option) {
  const defaultPrices = [0, 25, 60];
  function writePrices(factor, unit) {
    for (let index = 0; index < prices.length; index++) {
      prices[index].innerHTML = `${Math.round(
        defaultPrices[index] * factor
      )} <small class="priceUnit">${unit}</small`;
    }
  }
  switch (option) {
    case 0:
      writePrices(1, "EUR");
      break;
    case 1:
      writePrices(usdFactor, "USD");
      break;
    case 2:
      writePrices(gbpFactor, "GBP");
      break;
    default:
      writePrices(1, "EUR");
      break;
  }
}
//función para cambiar el estilo y mostrar cual es la moneda seleccionada
function cleanSelect() {
  for (let j = 0; j < currents.length; j++) {
    currents[j].classList.remove("selected");
  }
}

//Clase que recibe un id en el constructor, y asigna funcionalidades a ciertos elementos hijos,
//permitiendo mostrar diferentes imagenes al dar click sobre los controles
class Slider {
  constructor(id) {
    this.id = id;
    this.nextImg = this.filterByClass("span", "nextImg");
    this.prevImg = this.filterByClass("span", "prevImg");
    this.nextImg.onclick = () => {
      this.changeImg("next");
      this.lastMove = new Date();
    };
    this.prevImg.onclick = () => {
      this.changeImg("back");
      this.lastMove = new Date();
    };
    this.selectImg();
    this.lastMove = null;
  }

  /**
   * Funcion para obtener ciertos elementos hijos del elemento padre asignado en el constructor
   * @param {String} nodeName nombre de la etiqueta buscada (ej: img)
   * @returns {Array} lista de nodos filtrados, dentro de un array
   */
  filterByNodeName(nodeName) {
    nodeName = nodeName.toUpperCase();
    const nodeList = document.getElementById(this.id);
    const nodeListArray = [...nodeList.childNodes];
    const filter = nodeListArray.filter((item) => item.nodeName === nodeName);
    return filter;
  }

  /**
   * Funcion para obtener un elemento (o elementos) de los children del elemento padre asignado en el constructor
   * @param {String} nodeName nombre del tipo de elemento buscado en los children
   * @param {String} className nombre de la clase para filtar los elementos que coincidan con ella
   * @returns Elemento que cumple las condiciones anteriores
   */
  filterByClass(nodeName, className) {
    const nodeList = this.filterByNodeName(nodeName);
    const filter = nodeList.find((item) => {
      const class__name = item.classList.value;
      return class__name.includes(className) && item;
    });
    return filter;
  }

  /**
   * Funcion que se ejecuta al car click sobre los controles, mostrando la imagen siguiente o anterior, segun el parametro
   * @param {String} direction direccion en la que se deben mover las fotos: "next" || "back"
   */
  changeImg(direction) {
    const imgArray = this.filterByNodeName("img");
    const positionMarksDiv = this.filterByClass("div", "slider__position");
    const positionMarkItems = [
      ...positionMarksDiv.getElementsByClassName("slider__position-item"),
    ];
    const index = imgArray.findIndex((item) => !item.hidden);
    const totalImg = imgArray.length;
    direction = direction.trim().toLowerCase();
    if (direction === "next") {
      if (index < totalImg - 1) {
        imgArray[index].hidden = true;
        imgArray[index + 1].hidden = false;
        positionMarkItems[index].classList.remove("active");
        positionMarkItems[index + 1].classList.add("active");
      } else {
        imgArray[index].hidden = true;
        imgArray[0].hidden = false;
        positionMarkItems[index].classList.remove("active");
        positionMarkItems[0].classList.add("active");
      }
    } else {
      if (index > 0) {
        imgArray[index].hidden = true;
        imgArray[index - 1].hidden = false;
        positionMarkItems[index].classList.remove("active");
        positionMarkItems[index - 1].classList.add("active");
      } else {
        imgArray[index].hidden = true;
        imgArray[totalImg - 1].hidden = false;
        positionMarkItems[index].classList.remove("active");
        positionMarkItems[totalImg - 1].classList.add("active");
      }
    }
  }

  /**
   * Metodo que asigna funcionalidad a cada punto del slider para poder seleccionar la imagen correspondiente.
   */
  selectImg() {
    const imgArray = this.filterByNodeName("img");
    const positionMarksDiv = this.filterByClass("div", "slider__position");
    const positionMarkItems = [
      ...positionMarksDiv.getElementsByClassName("slider__position-item"),
    ];
    for (let index = 0; index < positionMarkItems.length; index++) {
      positionMarkItems[index].addEventListener("click", () => {
        for (let j = 0; j < imgArray.length; j++) {
          if (j === index) {
            imgArray[j].hidden = false;
            positionMarkItems[j].classList.add("active");
          } else {
            imgArray[j].hidden = true;
            positionMarkItems[j].classList.remove("active");
          }
        }
        this.lastMove = new Date();
      });
    }
  }

  /**
   * La funcion setea un intervalo para cambiar automaticamente las imagenes si paso cierto tiempo desde el ultimo cambio manual
   * @param {Number} interval El tiempo en milisegundos para el intervalo de cambio de imagenes
   */
  autoChange(interval) {
    setInterval(() => {
      new Date() - this.lastMove >= interval && this.changeImg("next");
    }, interval);
  }
}

const slider = new Slider("slider"); //Instancia de la clase Slider para ejecutar el constructor
slider.autoChange(5000); //Seteo del intervalo de cambio automatico de la imagen
