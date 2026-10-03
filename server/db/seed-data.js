// Datos iniciales tomados de los PDFs "MENU ZIBATA 2026" y "MENU DE BEBIDAS 2026".
// Cada platillo: { nombre, precio, descripcion?, precio_doble? }

const AC_PAPA = 'Acompañado de papa, ensalada verde y tortilla'
const AC_ARROZ = 'Acompañado de arroz y tortilla'

export const menus = [
  {
    slug: 'alimentos',
    nombre: 'Alimentos',
    categorias: [
      {
        nombre: 'Para Compartir',
        platillos: [
          { nombre: 'Nachos con queso', precio: 65 },
          { nombre: 'Nachos Zibatá', precio: 125 },
          { nombre: 'Carpaccio', precio: 80 },
        ],
      },
      {
        nombre: 'Desayunos',
        nota: 'Todos los desayunos incluyen frijoles, plátanos, tortillas, queso, crema, café o jugo de naranja.',
        platillos: [
          { nombre: 'Huevos revueltos con chorizo', precio: 60 },
          { nombre: 'Huevos revueltos con jamón', precio: 60 },
          { nombre: 'Huevos estrellados', precio: 60 },
          { nombre: 'Omelette de jamón y queso', precio: 60 },
          { nombre: 'Desayuno Zibatá de carne adobada', precio: 75 },
          { nombre: 'Desayuno Zibatá de lomito de res', precio: 80 },
        ],
      },
      {
        nombre: 'Típicos',
        nota: 'Todos los típicos llevan 3 unidades.',
        platillos: [
          { nombre: 'Tostadas con pasta de pollo', precio: 35 },
          { nombre: 'Tostadas con guacamol', precio: 30 },
          { nombre: 'Tostadas con frijol', precio: 25 },
          { nombre: 'Chuchitos de picado', precio: 35 },
          { nombre: 'Tortillas con chorizo Tecpán', precio: 80 },
          { nombre: 'Tortillas con chorizo argentino', precio: 80 },
          { nombre: 'Tacos de puyazo', precio: 90 },
        ],
      },
      {
        nombre: 'Comida Rápida',
        platillos: [
          { nombre: 'Hamburguesa con queso', precio: 75 },
          { nombre: 'Hamburguesa con tocino y queso', precio: 75 },
          { nombre: 'Sándwich con pasta de pollo', precio: 40 },
          { nombre: 'Sándwich con pollo a la plancha', precio: 70 },
          { nombre: 'Pizza de pepperoni', precio: 65 },
        ],
      },
      {
        nombre: 'Platillos Fuertes',
        platillos: [
          { nombre: 'Gallina en crema', precio: 95, descripcion: AC_ARROZ },
          { nombre: 'Caldo de gallina', precio: 90, descripcion: AC_ARROZ },
          { nombre: 'Carne asada', precio: 95, descripcion: AC_PAPA },
          { nombre: 'Filete de pechuga asada', precio: 85, descripcion: AC_PAPA },
          { nombre: 'Carne adobada de cerdo', precio: 85, descripcion: AC_PAPA },
          { nombre: 'Puyazo premium coulotte asado', precio: 140, descripcion: AC_PAPA },
          { nombre: 'Pescado frito', precio: 100, descripcion: 'Acompañado de ensalada, arroz, aguacate y tortilla' },
        ],
      },
      {
        nombre: 'Postres',
        platillos: [
          { nombre: 'Pastel de 3 leches', precio: 25 },
          { nombre: 'Plátanos fritos o asados', precio: 20 },
          { nombre: 'Pan de yema', precio: 5 },
        ],
      },
      {
        nombre: 'Bebidas Calientes',
        platillos: [
          { nombre: 'Café negro', precio: 25, descripcion: 'Incluye refil' },
          { nombre: 'Chocolate', precio: 25 },
          { nombre: 'Extra leche', precio: 5 },
        ],
      },
      {
        nombre: 'Bebidas Naturales',
        platillos: [
          { nombre: 'Refresco natural', precio: 25, descripcion: 'Pregunte por el refresco del día' },
          { nombre: 'Gaseosa en lata', precio: 10 },
          { nombre: 'Agua mineral en lata', precio: 10 },
          { nombre: 'Agua pura', precio: 10 },
          { nombre: 'Licuado de papaya', precio: 30 },
          { nombre: 'Licuado de melón', precio: 30 },
          { nombre: 'Naranjada con soda o agua', precio: 30 },
          { nombre: 'Jugo de naranja', precio: 20 },
          { nombre: 'Cimarrona', precio: 25 },
          { nombre: 'Cimarrona roja', precio: 30 },
        ],
      },
    ],
  },
  {
    slug: 'bebidas',
    nombre: 'Bebidas',
    categorias: [
      {
        nombre: 'Bebidas Preparadas',
        platillos: [
          { nombre: 'Gin Tonic', precio: 40, precio_doble: 70 },
          { nombre: 'Gin de Frutos', precio: 40, precio_doble: 70 },
          { nombre: 'Lemon Cream Gin', precio: 45, precio_doble: 80 },
          { nombre: 'Piña Colada', precio: 45, precio_doble: 80 },
          { nombre: 'Aperol Spritz', precio: 40, precio_doble: 80 },
          { nombre: 'Carajillo', precio: 45, precio_doble: 80 },
          { nombre: 'Sangría Roja', precio: 35, precio_doble: 60 },
          { nombre: 'Margarita', precio: 40, precio_doble: 80 },
          { nombre: 'Bloody Mary', precio: 40, precio_doble: 80 },
          { nombre: 'Long Island Tea', precio: 60, precio_doble: 100 },
        ],
      },
      {
        nombre: 'Cervezas',
        platillos: [
          { nombre: 'Cerveza Gallo', precio: 20 },
          { nombre: 'Cerveza Gallo Light', precio: 20 },
          { nombre: 'Cerveza Corona', precio: 20 },
          { nombre: 'Cerveza Modelo', precio: 20 },
          { nombre: 'Cerveza Modelo Negra', precio: 25 },
          { nombre: 'Cerveza Monte Carlo', precio: 25 },
          { nombre: 'Cerveza Monte Carlo Bajo Cero', precio: 25 },
          { nombre: 'Cerveza Stella Artois', precio: 25 },
          { nombre: 'Cerveza Heineken', precio: 25 },
          { nombre: 'Cerveza Cabro Reserva', precio: 25 },
          { nombre: 'Cerveza Michelob', precio: 25 },
          { nombre: 'Mix de Micheladas', precio: 15 },
        ],
      },
      {
        nombre: 'Vinos Tintos',
        platillos: [
          { nombre: '19 Crimes Red Blend', precio: 300, descripcion: '750 ml' },
          { nombre: 'Sangre de Toro (Vino Torres)', precio: 500, descripcion: '750 ml' },
          { nombre: 'La Nena Merlot', precio: 250, descripcion: '750 ml' },
          { nombre: 'J.P. Chenet Cabernet Syrah', precio: 250, descripcion: '750 ml' },
        ],
      },
      {
        nombre: 'Vinos Blancos',
        platillos: [
          { nombre: 'Torrae de Sale Sangio', precio: 275, descripcion: '750 ml' },
          { nombre: 'J.P. Chenet Sauvignon Blanc', precio: 225 },
        ],
      },
      {
        nombre: 'Vinos Rosados',
        platillos: [
          { nombre: 'Mateus', precio: 200, descripcion: '750 ml' },
          { nombre: 'J.P. Chenet Rosé', precio: 225 },
        ],
      },
      {
        nombre: 'Espumantes',
        platillos: [
          { nombre: 'Chandon Demi Sec', precio: 400, descripcion: '750 ml' },
          { nombre: 'Fragolino', precio: 200, descripcion: '750 ml' },
          { nombre: 'J.P. Chenet Ice Rosado', precio: 225 },
        ],
      },
      {
        nombre: 'Ron',
        platillos: [
          { nombre: 'Ron Zacapa XO', precio: 1500 },
          { nombre: 'Ron Zacapa', precio: 700 },
          { nombre: 'Botrán Añejo 18 años', precio: 450 },
          { nombre: 'Botrán Añejo 15 años', precio: 400 },
          { nombre: 'Botrán Añejo 12 años', precio: 350 },
          { nombre: 'Bacardí Blanco', precio: 250 },
          { nombre: 'XL', precio: 250 },
          { nombre: 'Venado Light', precio: 250 },
        ],
      },
      {
        nombre: 'Whisky por Trago',
        platillos: [
          { nombre: 'Johnnie Walker', precio: 40, descripcion: '1 onza' },
          { nombre: 'Johnnie Walker Double Black', precio: 50, descripcion: '1 onza' },
          { nombre: 'Old Parr', precio: 40, descripcion: '1 onza' },
        ],
      },
      {
        nombre: 'Whisky Botella',
        platillos: [
          { nombre: 'Johnnie Walker Black Label 12 años', precio: 550 },
          { nombre: 'Johnnie Walker Double Black', precio: 750 },
          { nombre: 'Old Parr 12 años', precio: 550 },
          { nombre: "Buchanan's Master 12 años", precio: 550 },
          { nombre: "Buchanan's 18 años", precio: 1400 },
          { nombre: 'Johnnie Walker 18 años', precio: 1400 },
        ],
      },
      {
        nombre: 'Tequila',
        platillos: [
          { nombre: 'Maestro Dobel', precio: 750 },
          { nombre: 'Don Julio 70', precio: 900 },
          { nombre: 'Don Julio Blanco', precio: 750 },
          { nombre: 'José Cuervo Cristalino', precio: 500 },
          { nombre: 'Patrón Silver', precio: 700 },
          { nombre: 'Patrón Reposado', precio: 1000 },
          { nombre: 'Corralejo', precio: 500 },
          { nombre: 'Jimador', precio: 350 },
          { nombre: 'Viuda', precio: 250 },
        ],
      },
    ],
  },
]
