from django.db import migrations


NOMBRES = (
    ('django', 'Django', 'Ciencia ficción'),
    ('python', 'Python', 'Drama'),
    ('bases-de-datos', 'Bases de datos', 'Aventura'),
    ('testing', 'Testing', 'Suspenso'),
    ('devops', 'DevOps', 'Romance'),
)


def nombrar_categorias(apps, schema_editor):
    categorias = apps.get_model('blog_app', 'Category').objects.using(
        schema_editor.connection.alias
    )
    for slug, anterior, nuevo in NOMBRES:
        if not categorias.filter(name=nuevo).exists():
            categorias.filter(slug=slug, name=anterior).update(name=nuevo)


class Migration(migrations.Migration):
    dependencies = [('blog_app', '0002_category_tag_authorprofile_article_category_and_more')]

    operations = [migrations.RunPython(nombrar_categorias, migrations.RunPython.noop)]
