from django.db import models

# Create your models here.


class pics(models.Model):
    pictures = (("Traditional", "Traditional"), ("Accessories",
                                   "Accessories"), ("Jeans", "Jeans"),("Tops","Tops"))

    name = models.CharField(max_length=100)
    img = models.ImageField(upload_to='pics')
    desc = models.TextField()
    price = models.IntegerField()
    offer = models.BooleanField(default=False)
    category = models.CharField(
        max_length=50, choices=pictures, null=True, blank=True)
