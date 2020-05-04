# Create your views here.
from django.shortcuts import render,redirect
from django.http import HttpResponse
from django.contrib.auth.models import User,auth
from django.contrib import messages

# Create your views here.

def login(request):
	if request.method=='POST':
		username=request.POST['uname']
		password=request.POST['psw']
		print(username)
		print(password)
		user = auth.authenticate(
                    username=username, password=password)
		print(user)
		if user is not None:
			auth.login(request,user)
			return redirect("/")
		else:
			messages.info(request,'inalid credentials')
			return redirect(login)

	else:
		return render(request,'login.html')
def logout(request):
	auth.logout(request)
	return redirect("/")

def register(request):
	if request.method=='POST':
		username=request.POST['usr']
		password1=request.POST['psw']
		password2=request.POST['psw-repeat']
		if password1==password2:
		
			if User.objects.filter(username=username).exists():
				messages.info(request,'username taken')
				return redirect(register)
			else:
				user=User.objects.create_user(password=password1,username=username)
				# user.set_password('password1')
				user.save()
				print("user created")
				messages.info(request,'user created')
				return redirect(login)
				
		else:
			messages.info(request,'password not matched')
			return redirect(register)
		return redirect('/')
	else:
		
		return render(request,'register.html')