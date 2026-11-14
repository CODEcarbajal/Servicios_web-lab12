# Laboratorio 12 · Consumo de una API REST desde React

El laboratorio conecta el proyecto React de Cine Aurora (Lab 11) con la API Django REST del Lab 8. La integración usa Axios para consultar categorías de la cartelera, admite operaciones de alta y borrado en el cliente de la API y muestra los estados de carga, datos y error en la interfaz.

## Arquitectura

```mermaid
flowchart LR
    R["React · localhost:5173"] --> A["Cliente Axios"]
    A -->|"HTTP · /api/categories/"| D["Django REST · localhost:8000"]
    D --> S[(SQLite)]
```

| Capa | Carpeta | Responsabilidad |
| --- | --- | --- |
| Cliente | `Lab11/` | Vite sirve la cartelera y la página `/categorias`. Axios centraliza las peticiones a Django. |
| Servidor | `Servicios_web-Django-Lab08/` | Django REST Framework expone los recursos en JSON y `django-cors-headers` autoriza el origen de React. |
| Datos | SQLite local de Django | Guarda las categorías que devuelve la API, incluidos los géneros de ejemplo de Cine Aurora. |

## Avance del equipo

Los pasos 1 a 6 configuran CORS, verifican las rutas de Django e incorporan Axios y el listado con carga, datos y error. Los pasos 7 a 12 añaden el borrado, la página de alta, los mensajes de validación y las pruebas provocadas de CORS y servidor apagado. El repositorio reúne ambos proyectos y sus evidencias para el paso 13. La entrega en el campus se verifica por separado.

Consulta el [avance detallado y la captura](docs/avance.md).

El [documento del laboratorio](https://docs.google.com/document/d/1IznOdCkEk4z_GaLl0GDVS-xth8FGnFo1/edit) contiene las explicaciones y capturas debajo de cada consigna.

## Servidor Django

En una terminal, desde la raíz del repositorio:

```bash
cd Servicios_web-Django-Lab08
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python manage.py migrate
python manage.py seed_blog
python manage.py runserver localhost:8000
```

`seed_blog` carga datos de ejemplo en la base SQLite local y reemplaza los registros de muestra existentes. Para actualizar una base del laboratorio con datos que quieras conservar, ejecuta solo `python manage.py migrate`. La migración actualiza las categorías originales de muestra que coinciden con los datos anteriores y conserva sus identificadores y relaciones.

## Rutas de la API

Se abrió la raíz en Chromium y Django REST Framework mostró **HTTP 200 OK** con enlaces a categorías, artículos y comentarios. El cliente del laboratorio consume categorías.

| Petición | URL | Respuesta |
| --- | --- | --- |
| `GET` | `http://localhost:8000/api/` | Índice de recursos de Django REST Framework. |
| `GET` | `http://localhost:8000/api/categories/` | Categorías paginadas en `results`, con `count`, `next` y `previous`. |
| `POST` | `http://localhost:8000/api/categories/` | Crea una categoría con `name`, `slug` y `description` opcional. |
| `DELETE` | `http://localhost:8000/api/categories/<slug>/` | Elimina la categoría indicada por su `slug` y devuelve `204` si tiene éxito. |

El listado devolvió HTTP 200 con cinco categorías después de ejecutar `seed_blog`. En las rutas `/api/`, Django envía `Access-Control-Allow-Origin: http://localhost:5173` para el origen del cliente React. Una petición de prueba desde `http://localhost:5174` obtuvo la respuesta sin esa cabecera.

## Cliente React

En otra terminal, desde la raíz del repositorio:

```bash
cd Lab11
npm ci
npm run dev
```

Abrir `http://localhost:5173`. Vite utiliza ese puerto para coincidir con el origen autorizado por Django.

Seleccionar **Categorías** en la navegación o abrir `http://localhost:5173/categorias`. La página solicita la primera página de categorías al entrar. El cliente Axios admite la variable `VITE_API_URL` para cambiar la dirección base de Django.

Las filas vienen de la base SQLite de Django a través de `GET /api/categories/`. Los géneros y sus descripciones se prepararon a partir de títulos y sinopsis de la cartelera ficticia, que se encuentran en `Lab11/src/datos/peliculas.js`. Django guarda esas categorías como registros independientes.

| Estado | Qué muestra el listado |
| --- | --- |
| Carga | Texto «Cargando categorías…» y un esqueleto de filas. |
| Datos | Tabla con nombre, `slug` y descripción, con navegación cuando hay más páginas. Si la lista está vacía, se muestra un mensaje. |
| Error | Motivo del fallo de conexión, tiempo de espera o código HTTP, y botón **Reintentar** para repetir la consulta en la misma página. |

## Crear y eliminar categorías

Desde el listado, **Nueva categoría** abre `/categorias/nueva`. Los campos controlados se envían con Axios a `POST /api/categories/`. Si Django devuelve `201`, React navega al listado sin recargar el documento y muestra la confirmación. El formulario utiliza `noValidate` para permitir la prueba de validación del servidor: enviar los campos obligatorios vacíos devuelve `400` y muestra los mensajes de Django conservando los valores introducidos.

Cada fila permite **Eliminar**, **Confirmar eliminación** o **Cancelar**. Después de recibir `204` de `DELETE /api/categories/<slug>/`, se vuelve a consultar la lista. Si se eliminó su última fila, se retrocede una página. Durante las operaciones se desactivan los controles para evitar envíos repetidos.

## Verificación de los pasos 7 a 12

Se probó en Chrome el alta y el borrado de una categoría temporal «Animación Lab12», el formulario vacío, la retirada temporal del origen CORS y el apagado de Django. La configuración de CORS quedó restaurada. Las [capturas y observaciones](docs/avance.md#paso-7--añadir-el-borrado) registran los resultados. También pasaron `npm run lint`, `npm run build`, `npm test` y `python manage.py check`.
