#!/bin/bash

# Compilar los archivos .java
javac -cp $CATALINA_HOME/lib/javax.ws.rs-api-2.0.1.jar:$CATALINA_HOME/lib/gson-2.3.1.jar:. api_rest/Servicio.java

# Eliminar directorios y archivos antiguos
rm -rf WEB-INF/classes/servicio_url/*
rm -rf WEB-INF/classes/servicio_json/*
rm -rf WEB-INF/classes/api_rest/*

# Copiar los archivos .class a la carpeta de destino
cp api_rest/*.class WEB-INF/classes/api_rest/.

# Crear el archivo .war
jar cvf Servicio.war WEB-INF META-INF

# Eliminar la aplicación previamente desplegada en Tomcat
rm -rf $CATALINA_HOME/webapps/Servicio.war $CATALINA_HOME/webapps/Servicio

# Copiar el archivo .war a la carpeta webapps de Tomcat
cp Servicio.war $CATALINA_HOME/webapps/
