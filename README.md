# ECommerceREST

Este es un prototipo de un sistema de comercio electrónico que implementa un CRUD utilizando un servicio REST utlizando el framework de Angular 18 como frontend, Java para el backend y Tomcat para levantar el servidor sobre un entorno de Linux.
## Requisitos Previos

- Node.js y npm instalados.
		sudo apt update
		curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
		nvm install 22
		node -v # should print `v22.12.0`
		npm -v # should print `10.9.0`
- Java Development Kit (JDK) instalado.
		sudo apt update
		sudo apt install openjdk-21-jdk
		java -version 

- Apache Tomcat 8.5.99.
Para ejecutar el servidor de Tomcat será necesario crear las variables de entorno para JAVA_HOME y CATALINA_HOME, para esto ejeutamos los siguientes dos comandos:
		export CATALINA_HOME=aquí va la ruta absoluta del directorio de Tomcat 8
		export JAVA_HOME= aquíva la ruta absoluta del directorio donde está el directorio bin que contiene el programa java
Si quieres solo replicar para ejecutar como está realiza lo siguiente:

- Clona el proyecto en un repositorio local con:
		https://github.com/TheTortillas/JavaCRUDService.git
-
