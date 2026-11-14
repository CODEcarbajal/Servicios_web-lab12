from django.db import migrations
from django.db.models import Q


CATEGORIAS = (
    ('django', 'Django', 'Artículos sobre Django framework', 'Ciencia ficción',
     'ciencia-ficcion', 'Viajes espaciales e inventos en Órbita lejana y Una casa en las nubes.'),
    ('python', 'Python', 'Artículos sobre Python', 'Drama',
     'drama', 'Historias de amistad y decisiones difíciles en El último verano y Marea adentro.'),
    ('bases-de-datos', 'Bases de datos', 'Artículos sobre bases de datos y ORM', 'Aventura',
     'aventura', 'Exploraciones y viajes en El bosque secreto y Ruta al amanecer.'),
    ('testing', 'Testing', 'Artículos sobre testing', 'Suspenso',
     'suspenso', 'Una investigación sobre una grabación misteriosa en El eco del silencio.'),
    ('devops', 'DevOps', 'Artículos sobre DevOps y despliegue', 'Romance',
     'romance', 'Un pianista y una fotógrafa se conocen en Después de medianoche.'),
)


def actualizar_categorias(apps, schema_editor):
    categorias = apps.get_model('blog_app', 'Category').objects.using(
        schema_editor.connection.alias
    )
    for slug_anterior, nombre_anterior, descripcion_anterior, nombre, slug, descripcion in CATEGORIAS:
        candidatas = categorias.filter(
            slug=slug_anterior, name__in=(nombre_anterior, nombre), description=descripcion_anterior,
        )
        existentes = categorias.filter(Q(slug=slug) | Q(name=nombre)).exclude(pk__in=candidatas)
        if not existentes.exists():
            candidatas.update(name=nombre, slug=slug, description=descripcion)


class Migration(migrations.Migration):
    dependencies = [('blog_app', '0003_nombres_categorias_cine')]

    operations = [migrations.RunPython(actualizar_categorias, migrations.RunPython.noop)]
