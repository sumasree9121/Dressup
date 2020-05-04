from django.shortcuts import render
from django.http import HttpResponse
from .models import pics


def page(request):
    dests = pics.objects.all()
    category = request.GET.get('category')
    if category:
    	dests = pics.objects.filter(category = category)
    return render(request, "index.html", {'dests': dests})
