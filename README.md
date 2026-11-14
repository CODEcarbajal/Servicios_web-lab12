# Laboratorio 12 · React y Django REST

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

`seed_blog` carga datos de ejemplo en la base SQLite local. Los archivos de la base se generan al preparar el entorno.

## Rutas de la API

Se abrió la raíz en Chromium y Django REST Framework mostró **HTTP 200 OK** con enlaces a categorías, artículos y comentarios. El cliente del laboratorio consume categorías.

| Petición | URL | Respuesta |
| --- | --- | --- |
| `GET` | `http://localhost:8000/api/` | Índice de recursos de Django REST Framework. |
| `GET` | `http://localhost:8000/api/categories/` | Categorías paginadas en `results`, con `count`, `next` y `previous`. |
| `POST` | `http://localhost:8000/api/categories/` | Crea una categoría con `name`, `slug` y `description` opcional. |
| `DELETE` | `http://localhost:8000/api/categories/<slug>/` | Elimina la categoría indicada por su `slug` y devuelve `204` si tiene éxito. |

El listado devolvió HTTP 200 con cinco categorías después de ejecutar `seed_blog`. En las rutas `/api/`, Django envía `Access-Control-Allow-Origin: http://localhost:5173` para el origen del cliente React. Una petición de prueba desde `http://localhost:5174` obtuvo la respuesta sin esa cabecera.
