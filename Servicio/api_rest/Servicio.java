/*
  Servicio.java
  Servicio web tipo REST
  Recibe parámetros utilizando JSON
  Carlos Pineda Guerrero, septiembre 2024
*/

package api_rest;

import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Consumes;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.QueryParam;
import javax.ws.rs.FormParam;
import javax.ws.rs.core.Response;

import java.math.BigDecimal;
import java.sql.*;
import javax.sql.DataSource;
import javax.naming.Context;
import javax.naming.InitialContext;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import com.google.gson.*;

// la URL del servicio web es http://localhost:8080/Servicio/rest/ws
// donde:
//	"Servicio" es el dominio del WSCservicio web (es decir, el nombre de archivo Servicio.war)
//	"rest" se define en la etiqueta <url-pattern> de <servlet-mapping> en el archivo WEB-INF\web.xml
//	"ws" se define en la siguiente anotación @Path de la clase Servicio

@Path("ws")
public class Servicio {
  static DataSource pool = null;
  static {
    try {
      Context ctx = new InitialContext();
      pool = (DataSource) ctx.lookup("java:comp/env/jdbc/datasource_Servicio");
    } catch (Exception e) {
      e.printStackTrace();
    }
  }

  static Gson j = new GsonBuilder().registerTypeAdapter(byte[].class, new AdaptadorGsonBase64())
      .setDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS").create();

  @POST
  @Path("alta_usuario")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response alta(String json) throws Exception {
    ParamAltaUsuario p = (ParamAltaUsuario) j.fromJson(json, ParamAltaUsuario.class);
    Usuario usuario = p.usuario;

    Connection conexion = pool.getConnection();

    if (usuario.email == null || usuario.email.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el email"))).build();

    if (usuario.nombre == null || usuario.nombre.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el nombre"))).build();

    if (usuario.apellido_paterno == null || usuario.apellido_paterno.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el apellido paterno"))).build();

    if (usuario.fecha_nacimiento == null)
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar la fecha de nacimiento"))).build();

    try {
      conexion.setAutoCommit(false);

      PreparedStatement stmt_1 = conexion.prepareStatement(
          "INSERT INTO usuarios(id_usuario,email,nombre,apellido_paterno,apellido_materno,fecha_nacimiento,telefono,genero) VALUES (0,?,?,?,?,?,?,?)");

      try {
        stmt_1.setString(1, usuario.email);
        stmt_1.setString(2, usuario.nombre);
        stmt_1.setString(3, usuario.apellido_paterno);

        if (usuario.apellido_materno != null)
          stmt_1.setString(4, usuario.apellido_materno);
        else
          stmt_1.setNull(4, Types.VARCHAR);

        stmt_1.setTimestamp(5, usuario.fecha_nacimiento);

        if (usuario.telefono != null)
          stmt_1.setLong(6, usuario.telefono);
        else
          stmt_1.setNull(6, Types.BIGINT);

        if (usuario.genero != null)
          stmt_1.setString(7, usuario.genero);
        else
          stmt_1.setNull(7, Types.CHAR);

        stmt_1.executeUpdate();
      } finally {
        stmt_1.close();
      }

      if (usuario.foto != null) {
        PreparedStatement stmt_2 = conexion
            .prepareStatement("INSERT INTO fotos_usuarios(id_foto,foto,id_usuario) VALUES (0,?,LAST_INSERT_ID())");
        try {
          stmt_2.setBytes(1, usuario.foto);
          // stmt_2.setString(2,usuario.email);
          stmt_2.executeUpdate();
        } finally {
          stmt_2.close();
        }
      }
      conexion.commit();
    } catch (Exception e) {
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }
    return Response.ok().build();
  }

  @POST
  @Path("consulta_usuario")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response consulta(String json) throws Exception {
    ParamConsultaUsuario p = (ParamConsultaUsuario) j.fromJson(json, ParamConsultaUsuario.class);
    String email = p.email;

    Connection conexion = pool.getConnection();

    try {
      PreparedStatement stmt_1 = conexion.prepareStatement(
          "SELECT a.email,a.nombre,a.apellido_paterno,a.apellido_materno,a.fecha_nacimiento,a.telefono,a.genero,b.foto FROM usuarios a LEFT OUTER JOIN fotos_usuarios b ON a.id_usuario=b.id_usuario WHERE email=?");
      try {
        stmt_1.setString(1, email);

        ResultSet rs = stmt_1.executeQuery();
        try {
          if (rs.next()) {
            Usuario r = new Usuario();
            r.email = rs.getString(1);
            r.nombre = rs.getString(2);
            r.apellido_paterno = rs.getString(3);
            r.apellido_materno = rs.getString(4);
            r.fecha_nacimiento = rs.getTimestamp(5);
            r.telefono = rs.getObject(6) != null ? rs.getLong(6) : null;
            r.genero = rs.getString(7);
            r.foto = rs.getBytes(8);
            return Response.ok().entity(j.toJson(r)).build();
          }
          return Response.status(400).entity(j.toJson(new Error("El email no existe"))).build();
        } finally {
          rs.close();
        }
      } finally {
        stmt_1.close();
      }
    } catch (Exception e) {
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.close();
    }
  }

  @POST
  @Path("modifica_usuario")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response modifica(String json) throws Exception {
    ParamModificaUsuario p = (ParamModificaUsuario) j.fromJson(json, ParamModificaUsuario.class);
    Usuario usuario = p.usuario;

    Connection conexion = pool.getConnection();

    if (usuario.email == null || usuario.email.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el email"))).build();

    if (usuario.nombre == null || usuario.nombre.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el nombre"))).build();

    if (usuario.apellido_paterno == null || usuario.apellido_paterno.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el apellido paterno"))).build();

    if (usuario.fecha_nacimiento == null)
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar la fecha de nacimiento"))).build();

    conexion.setAutoCommit(false);
    try {
      PreparedStatement stmt_1 = conexion.prepareStatement(
          "UPDATE usuarios SET nombre=?,apellido_paterno=?,apellido_materno=?,fecha_nacimiento=?,telefono=?,genero=? WHERE email=?");
      try {
        stmt_1.setString(1, usuario.nombre);
        stmt_1.setString(2, usuario.apellido_paterno);

        if (usuario.apellido_materno != null)
          stmt_1.setString(3, usuario.apellido_materno);
        else
          stmt_1.setNull(3, Types.VARCHAR);

        stmt_1.setTimestamp(4, usuario.fecha_nacimiento);

        if (usuario.telefono != null)
          stmt_1.setLong(5, usuario.telefono);
        else
          stmt_1.setNull(5, Types.BIGINT);

        if (usuario.genero != null)
          stmt_1.setString(6, usuario.genero);
        else
          stmt_1.setNull(6, Types.CHAR);

        stmt_1.setString(7, usuario.email);

        stmt_1.executeUpdate();
      } finally {
        stmt_1.close();
      }

      PreparedStatement stmt_2 = conexion.prepareStatement(
          "DELETE FROM fotos_usuarios WHERE id_usuario=(SELECT id_usuario FROM usuarios WHERE email=?)");
      try {
        stmt_2.setString(1, usuario.email);
        stmt_2.executeUpdate();
      } finally {
        stmt_2.close();
      }

      if (usuario.foto != null) {
        PreparedStatement stmt_3 = conexion.prepareStatement(
            "INSERT INTO fotos_usuarios(id_foto,foto,id_usuario) VALUES (0,?,(SELECT id_usuario FROM usuarios WHERE email=?))");
        try {
          stmt_3.setBytes(1, usuario.foto);
          stmt_3.setString(2, usuario.email);
          stmt_3.executeUpdate();
        } finally {
          stmt_3.close();
        }
      }
      conexion.commit();
    } catch (Exception e) {
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }
    return Response.ok().build();
  }

  @POST
  @Path("borra_usuario")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response borra(String json) throws Exception {
    ParamBorraUsuario p = (ParamBorraUsuario) j.fromJson(json, ParamBorraUsuario.class);
    String email = p.email;

    Connection conexion = pool.getConnection();

    try {
      PreparedStatement stmt_1 = conexion.prepareStatement("SELECT 1 FROM usuarios WHERE email=?");
      try {
        stmt_1.setString(1, email);

        ResultSet rs = stmt_1.executeQuery();
        try {
          if (!rs.next())
            return Response.status(400).entity(j.toJson(new Error("El email no existe"))).build();
        } finally {
          rs.close();
        }
      } finally {
        stmt_1.close();
      }
      conexion.setAutoCommit(false);
      PreparedStatement stmt_2 = conexion.prepareStatement(
          "DELETE FROM fotos_usuarios WHERE id_usuario=(SELECT id_usuario FROM usuarios WHERE email=?)");
      try {
        stmt_2.setString(1, email);
        stmt_2.executeUpdate();
      } finally {
        stmt_2.close();
      }

      PreparedStatement stmt_3 = conexion.prepareStatement("DELETE FROM usuarios WHERE email=?");
      try {
        stmt_3.setString(1, email);
        stmt_3.executeUpdate();
      } finally {
        stmt_3.close();
      }
      conexion.commit();
    } catch (Exception e) {
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }
    return Response.ok().build();
  }

  // Endpoints para el carrito (Alta de productos y compra de productos)
  @POST
  @Path("alta_articulo")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response altaArticulo(String json) throws Exception {
    // Deserializamos el JSON recibido a un objeto de tipo ParamAltaArticulo
    ParamAltaArticulo p = (ParamAltaArticulo) j.fromJson(json, ParamAltaArticulo.class);
    Articulo articulo = p.articulo;

    // Establecemos la conexión con la base de datos
    Connection conexion = pool.getConnection();

    // Validación de campos obligatorios
    if (articulo.nombre == null || articulo.nombre.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el nombre del artículo"))).build();

    if (articulo.precio == null || articulo.precio <= 0)
      return Response.status(400).entity(j.toJson(new Error("El precio debe ser mayor a cero"))).build();

    if (articulo.cantidad == null || articulo.cantidad < 0)
      return Response.status(400).entity(j.toJson(new Error("La cantidad debe ser mayor o igual a cero"))).build();

    // Comienza la transacción
    try {
      conexion.setAutoCommit(false);

      // Insertamos el artículo en la tabla 'articulos'
      PreparedStatement stmt_1 = conexion.prepareStatement(
          "INSERT INTO articulos(id_articulo, nombre, descripcion, precio, cantidad) VALUES (0, ?, ?, ?, ?)",
          Statement.RETURN_GENERATED_KEYS);
      try {
        stmt_1.setString(1, articulo.nombre);
        stmt_1.setString(2, articulo.descripcion);
        stmt_1.setBigDecimal(3, BigDecimal.valueOf(articulo.precio));
        stmt_1.setInt(4, articulo.cantidad);

        stmt_1.executeUpdate();

        // Obtenemos el id_articulo generado automáticamente
        ResultSet rs = stmt_1.getGeneratedKeys();
        int idArticulo = -1;
        if (rs.next()) {
          idArticulo = rs.getInt(1);
        }

        // Si el artículo tiene una foto, insertamos la foto en la tabla
        // 'fotos_articulos'
        if (articulo.foto != null) {
          PreparedStatement stmt_2 = conexion
              .prepareStatement("INSERT INTO fotos_articulos(id_foto_articulo, foto, id_articulo) VALUES (0, ?, ?)");
          try {
            stmt_2.setBytes(1, articulo.foto);
            stmt_2.setInt(2, idArticulo);
            stmt_2.executeUpdate();
          } finally {
            stmt_2.close();
          }
        }
      } finally {
        stmt_1.close();
      }

      // Confirmamos la transacción
      conexion.commit();
    } catch (Exception e) {
      // Si algo sale mal, deshacemos la transacción
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }

    // Retornamos una respuesta exitosa
    return Response.ok().build();
  }

  @POST
  @Path("consulta_articulo")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response consultaArticulo(String json) throws Exception {
    // Parsear el JSON recibido para obtener el nombre del artículo
    ParamConsultaArticulo p = (ParamConsultaArticulo) j.fromJson(json, ParamConsultaArticulo.class);
    String nombreArticulo = p.nombre;

    // Establecer la conexión a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Preparar la consulta SQL para obtener los datos del artículo por nombre
      PreparedStatement stmt_1 = conexion.prepareStatement(
          "SELECT a.id_articulo, a.nombre, a.descripcion, a.precio, a.cantidad, b.foto FROM articulos a LEFT OUTER JOIN fotos_articulos b ON a.id_articulo = b.id_articulo WHERE a.nombre = ?");
      try {
        // Establecer el parámetro de búsqueda (nombre del artículo)
        stmt_1.setString(1, nombreArticulo);

        // Ejecutar la consulta
        ResultSet rs = stmt_1.executeQuery();
        try {
          // Si se encuentran resultados en la base de datos
          if (rs.next()) {
            // Crear el objeto Articulo para mapear los resultados
            Articulo r = new Articulo();
            r.id_articulo = rs.getInt(1); // Asignar el ID del artículo
            r.nombre = rs.getString(2);
            r.descripcion = rs.getString(3);
            r.precio = rs.getFloat(4);
            r.cantidad = rs.getInt(5);
            r.foto = rs.getBytes(6);
            // Retornar la respuesta exitosa con el objeto Articulo en formato JSON
            return Response.ok().entity(j.toJson(r)).build();
          }

          // Si no se encuentra el artículo
          return Response.status(400).entity(j.toJson(new Error("El artículo no existe"))).build();
        } finally {
          // Cerrar el ResultSet
          rs.close();
        }
      } finally {
        // Cerrar el PreparedStatement
        stmt_1.close();
      }
    } catch (Exception e) {
      // Manejo de excepciones y retorno de un error
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      // Asegurarse de cerrar la conexión a la base de datos
      conexion.close();
    }
  }

  @GET
  @Path("lista_articulos")
  @Produces(MediaType.APPLICATION_JSON)
  public Response listaArticulos() throws Exception {
    // Establecer la conexión a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Preparar la consulta SQL para obtener todos los artículos
      PreparedStatement stmt_1 = conexion.prepareStatement(
          "SELECT a.id_articulo, a.nombre, a.descripcion, a.precio, a.cantidad, b.foto FROM articulos a LEFT OUTER JOIN fotos_articulos b ON a.id_articulo = b.id_articulo");
      try {
        // Ejecutar la consulta
        ResultSet rs = stmt_1.executeQuery();
        try {
          // Crear una lista para almacenar los artículos
          ArrayList<Articulo> articulos = new ArrayList<>();

          // Iterar sobre los resultados de la consulta
          while (rs.next()) {
            // Crear el objeto Articulo para mapear los resultados
            Articulo articulo = new Articulo();
            articulo.id_articulo = rs.getInt(1); // Asignar el ID del artículo
            articulo.nombre = rs.getString(2); // Asignar el nombre del artículo
            articulo.descripcion = rs.getString(3); // Asignar la descripción
            articulo.precio = rs.getFloat(4); // Asignar el precio
            articulo.cantidad = rs.getInt(5); // Asignar la cantidad
            articulo.foto = rs.getBytes(6); // Asignar la foto como byte[]

            // Agregar el artículo a la lista
            articulos.add(articulo);
          }

          // Retornar la respuesta exitosa con la lista de artículos en formato JSON
          return Response.ok().entity(j.toJson(articulos)).build();
        } finally {
          // Cerrar el ResultSet
          rs.close();
        }
      } finally {
        // Cerrar el PreparedStatement
        stmt_1.close();
      }
    } catch (Exception e) {
      // Manejo de excepciones y retorno de un error
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      // Asegurarse de cerrar la conexión a la base de datos
      conexion.close();
    }
  }

  @POST
  @Path("modifica_articulo")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response modificaArticulo(String json) throws Exception {
    ParamModificaArticulo p = (ParamModificaArticulo) j.fromJson(json, ParamModificaArticulo.class);
    Articulo articulo = p.articulo;

    // Validar los campos esenciales del artículo
    if (articulo.id_articulo <= 0)
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el ID del artículo"))).build();

    if (articulo.nombre == null || articulo.nombre.equals(""))
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar el nombre del artículo"))).build();

    if (articulo.precio <= 0)
      return Response.status(400).entity(j.toJson(new Error("Se debe ingresar un precio válido"))).build();

    if (articulo.cantidad < 0)
      return Response.status(400).entity(j.toJson(new Error("La cantidad no puede ser negativa"))).build();

    Connection conexion = pool.getConnection();
    conexion.setAutoCommit(false);

    try {
      // Actualizar el artículo usando el id_articulo
      PreparedStatement stmt_1 = conexion
          .prepareStatement("UPDATE articulos SET nombre=?, descripcion=?, precio=?, cantidad=? WHERE id_articulo=?");
      try {
        stmt_1.setString(1, articulo.nombre);
        stmt_1.setString(2, articulo.descripcion);
        stmt_1.setFloat(3, articulo.precio);
        stmt_1.setInt(4, articulo.cantidad);
        stmt_1.setInt(5, articulo.id_articulo); // Usamos el ID como referencia
        stmt_1.executeUpdate();
      } finally {
        stmt_1.close();
      }

      // Si el artículo tiene una nueva foto, actualizamos la foto
      if (articulo.foto != null) {
        // Eliminar la foto anterior
        PreparedStatement stmt_2 = conexion.prepareStatement("DELETE FROM fotos_articulos WHERE id_articulo=?");
        try {
          stmt_2.setInt(1, articulo.id_articulo); // Usamos el ID como referencia
          stmt_2.executeUpdate();
        } finally {
          stmt_2.close();
        }

        // Insertar la nueva foto en fotos_articulos
        PreparedStatement stmt_3 = conexion
            .prepareStatement("INSERT INTO fotos_articulos(id_foto_articulo, foto, id_articulo) VALUES (0, ?, ?)");
        try {
          stmt_3.setBytes(1, articulo.foto); // Guardar la foto en formato byte[]
          stmt_3.setInt(2, articulo.id_articulo); // Usamos el ID como referencia
          stmt_3.executeUpdate();
        } finally {
          stmt_3.close();
        }
      }

      // Confirmar la transacción
      conexion.commit();
    } catch (Exception e) {
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }

    // Responder con éxito
    return Response.ok().build();
  }

  @POST
  @Path("borra_articulo")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response borraArticulo(String json) throws Exception {
    // Convertimos el JSON a un objeto ParamBorraArticulo
    ParamBorraArticulo p = (ParamBorraArticulo) j.fromJson(json, ParamBorraArticulo.class);
    Integer id_articulo = p.id_articulo;

    // Establecemos la conexión con la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Verificamos si el artículo existe
      PreparedStatement stmt_1 = conexion.prepareStatement("SELECT 1 FROM articulos WHERE id_articulo=?");
      try {
        stmt_1.setInt(1, id_articulo);

        ResultSet rs = stmt_1.executeQuery();
        try {
          if (!rs.next()) {
            return Response.status(400).entity(j.toJson(new Error("El artículo no existe"))).build();
          }
        } finally {
          rs.close();
        }
      } finally {
        stmt_1.close();
      }

      // Comenzamos la transacción
      conexion.setAutoCommit(false);

      // Primero eliminamos las fotos asociadas al artículo
      PreparedStatement stmt_2 = conexion.prepareStatement("DELETE FROM fotos_articulos WHERE id_articulo=?");
      try {
        stmt_2.setInt(1, id_articulo);
        stmt_2.executeUpdate();
      } finally {
        stmt_2.close();
      }

      // Ahora eliminamos el artículo
      PreparedStatement stmt_3 = conexion.prepareStatement("DELETE FROM articulos WHERE id_articulo=?");
      try {
        stmt_3.setInt(1, id_articulo);
        stmt_3.executeUpdate();
      } finally {
        stmt_3.close();
      }

      // Confirmamos la transacción
      conexion.commit();
    } catch (Exception e) {
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }
    return Response.ok().build();
  }

  @GET
  @Path("obtener_cantidad_disponible")
  @Produces(MediaType.APPLICATION_JSON)
  public Response obtenerCantidadDisponible(@QueryParam("id_articulo") Integer id_articulo) throws Exception {
    // Validar que el parámetro no sea nulo ni inválido
    if (id_articulo == null || id_articulo <= 0) {
      return Response.status(400).entity(j.toJson(new Error("El ID del artículo es requerido y debe ser mayor a 0")))
          .build();
    }

    // Establecer la conexión a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Preparar la consulta SQL para obtener la cantidad disponible
      String sql = "SELECT cantidad FROM articulos WHERE id_articulo = ?";
      PreparedStatement stmt = conexion.prepareStatement(sql);
      stmt.setInt(1, id_articulo);

      // Ejecutar la consulta
      ResultSet rs = stmt.executeQuery();
      try {
        // Verificar si el artículo existe
        if (rs.next()) {
          int cantidadDisponible = rs.getInt("cantidad");
          // Retornar la cantidad disponible en formato JSON
          return Response.ok().entity(j.toJson(cantidadDisponible)).build();
        } else {
          // Retornar un error si el artículo no existe
          return Response.status(404).entity(j.toJson(new Error("El artículo no existe"))).build();
        }
      } finally {
        // Cerrar el ResultSet
        rs.close();
      }
    } catch (Exception e) {
      // Manejo de excepciones y retorno de un error
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      // Asegurarse de cerrar la conexión a la base de datos
      conexion.close();
    }
  }

  @POST
  @Path("agregar_al_carrito")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response agregarAlCarrito(String json) throws Exception {
    // Convertimos el JSON recibido en un objeto ParamAgregarCarrito
    ParamAgregarCarrito p = (ParamAgregarCarrito) j.fromJson(json, ParamAgregarCarrito.class);
    Integer id_articulo = p.id_articulo;
    Integer cantidad = p.cantidad;

    // Conectamos a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Verificamos si el artículo existe en la base de datos
      PreparedStatement stmt_1 = conexion.prepareStatement("SELECT cantidad FROM articulos WHERE id_articulo=?");
      try {
        stmt_1.setInt(1, id_articulo);
        ResultSet rs = stmt_1.executeQuery();
        try {
          if (!rs.next()) {
            return Response.status(400).entity(j.toJson(new Error("El artículo no existe"))).build();
          }

          // Verificamos si la cantidad solicitada no excede la disponible en inventario
          int cantidadDisponible = rs.getInt("cantidad");
          if (cantidad > cantidadDisponible) {
            return Response.status(400)
                .entity(j.toJson(new Error("Cantidad solicitada excede el inventario disponible"))).build();
          }
        } finally {
          rs.close();
        }
      } finally {
        stmt_1.close();
      }

      // Comenzamos la transacción
      conexion.setAutoCommit(false);

      // Verificamos si el artículo ya está en el carrito
      PreparedStatement stmt_2 = conexion.prepareStatement("SELECT cantidad FROM carrito_compra WHERE id_articulo=?");
      try {
        stmt_2.setInt(1, id_articulo);
        ResultSet rs = stmt_2.executeQuery();
        try {
          if (rs.next()) {
            // Si ya existe, actualizamos la cantidad
            int cantidadExistente = rs.getInt("cantidad");
            PreparedStatement stmt_3 = conexion.prepareStatement(
                "UPDATE carrito_compra SET cantidad=? WHERE id_articulo=?");
            try {
              // Actualizamos la cantidad del artículo
              stmt_3.setInt(1, cantidadExistente + cantidad); // Sumamos la cantidad
              stmt_3.setInt(2, id_articulo);
              stmt_3.executeUpdate();
            } finally {
              stmt_3.close();
            }
          } else {
            // Si no existe en el carrito, insertamos el artículo
            PreparedStatement stmt_4 = conexion.prepareStatement(
                "INSERT INTO carrito_compra (id_articulo, cantidad) VALUES (?, ?)");
            try {
              stmt_4.setInt(1, id_articulo);
              stmt_4.setInt(2, cantidad);
              stmt_4.executeUpdate();
            } finally {
              stmt_4.close();
            }
          }
        } finally {
          rs.close();
        }
      } finally {
        stmt_2.close();
      }

      // Confirmamos la transacción
      conexion.commit();
    } catch (Exception e) {
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }

    return Response.ok().build(); // Respuesta exitosa
  }

  @POST
  @Path("eliminar_del_carrito")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response eliminarDelCarrito(String json) throws Exception {
    // Convertimos el JSON recibido en un objeto ParamEliminarCarrito
    ParamEliminarCarrito p = (ParamEliminarCarrito) j.fromJson(json, ParamEliminarCarrito.class);
    Integer id_articulo = p.id_articulo;

    // Conectamos a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Verificamos si el artículo está en el carrito
      PreparedStatement stmt_1 = conexion.prepareStatement("SELECT 1 FROM carrito_compra WHERE id_articulo=?");
      try {
        stmt_1.setInt(1, id_articulo);
        ResultSet rs = stmt_1.executeQuery();
        try {
          if (!rs.next()) {
            return Response.status(400).entity(j.toJson(new Error("El artículo no está en el carrito"))).build();
          }
        } finally {
          rs.close();
        }
      } finally {
        stmt_1.close();
      }

      // Comenzamos la transacción
      conexion.setAutoCommit(false);

      // Eliminar el artículo del carrito
      PreparedStatement stmt_2 = conexion.prepareStatement("DELETE FROM carrito_compra WHERE id_articulo=?");
      try {
        stmt_2.setInt(1, id_articulo);
        stmt_2.executeUpdate();
      } finally {
        stmt_2.close();
      }

      // Confirmamos la transacción
      conexion.commit();
    } catch (Exception e) {
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      conexion.setAutoCommit(true);
      conexion.close();
    }

    // Responder con éxito
    return Response.ok().build();
  }

  @GET
  @Path("ver_carrito")
  @Produces(MediaType.APPLICATION_JSON)
  public Response verCarrito() throws Exception {
    // Establecer la conexión a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Preparar la consulta SQL para obtener los artículos del carrito con sus
      // detalles
      String sql = "SELECT c.id_articulo, a.nombre, a.precio, c.cantidad, b.foto " +
          "FROM carrito_compra c " +
          "JOIN articulos a ON c.id_articulo = a.id_articulo " +
          "LEFT JOIN fotos_articulos b ON a.id_articulo = b.id_articulo";

      PreparedStatement stmt_1 = conexion.prepareStatement(sql);

      // Ejecutar la consulta
      ResultSet rs = stmt_1.executeQuery();
      try {
        // Crear una lista para almacenar los artículos del carrito
        ArrayList<CarritoItem> carritoItems = new ArrayList<>();

        // Iterar sobre los resultados de la consulta
        while (rs.next()) {
          // Crear el objeto CarritoItem para mapear los resultados
          CarritoItem item = new CarritoItem();
          item.id_articulo = rs.getInt("id_articulo"); // ID del artículo
          item.nombre = rs.getString("nombre"); // Nombre del artículo
          item.precio = rs.getFloat("precio"); // Precio unitario
          item.cantidad = rs.getInt("cantidad"); // Cantidad en el carrito
          item.foto = rs.getBytes("foto"); // Foto del artículo como byte[]

          // Agregar el item a la lista
          carritoItems.add(item);
        }

        // Retornar la respuesta exitosa con la lista de artículos del carrito en
        // formato JSON
        return Response.ok().entity(j.toJson(carritoItems)).build();
      } finally {
        // Cerrar el ResultSet
        rs.close();
      }
    } catch (Exception e) {
      // Manejo de excepciones y retorno de un error
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      // Asegurarse de cerrar la conexión a la base de datos
      conexion.close();
    }
  }

  @GET
  @Path("buscar_articulos_SELECT_CON_LIKE")
  @Produces(MediaType.APPLICATION_JSON)
  public Response buscarArticulos(@QueryParam("search") String searchTerm) throws Exception {
    if (searchTerm == null || searchTerm.trim().isEmpty()) {
      return Response.status(400).entity(j.toJson(new Error("El término de búsqueda no puede estar vacío"))).build();
    }

    // Establecer la conexión a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Preparar la consulta SQL para buscar artículos con LIKE en nombre y
      // descripción
      String sql = "SELECT a.id_articulo, a.nombre, a.descripcion, a.precio, a.cantidad, b.foto " +
          "FROM articulos a " +
          "LEFT JOIN fotos_articulos b ON a.id_articulo = b.id_articulo " +
          "WHERE a.nombre LIKE ? OR a.descripcion LIKE ?";

      PreparedStatement stmt_1 = conexion.prepareStatement(sql);
      String searchPattern = "%" + searchTerm + "%"; // Agregar los comodines '%' al término de búsqueda

      // Establecer el parámetro de búsqueda en la consulta SQL
      stmt_1.setString(1, searchPattern);
      stmt_1.setString(2, searchPattern);

      // Ejecutar la consulta
      ResultSet rs = stmt_1.executeQuery();
      try {
        // Crear una lista para almacenar los artículos encontrados
        ArrayList<Articulo> articulos = new ArrayList<>();

        // Iterar sobre los resultados de la consulta
        while (rs.next()) {
          // Crear el objeto Articulo para mapear los resultados
          Articulo articulo = new Articulo();
          articulo.id_articulo = rs.getInt("id_articulo"); // ID del artículo
          articulo.nombre = rs.getString("nombre"); // Nombre del artículo
          articulo.descripcion = rs.getString("descripcion"); // Descripción del artículo
          articulo.precio = rs.getFloat("precio"); // Precio del artículo
          articulo.cantidad = rs.getInt("cantidad"); // Cantidad del artículo
          articulo.foto = rs.getBytes("foto"); // Foto del artículo (si existe)

          // Agregar el artículo a la lista
          articulos.add(articulo);
        }

        // Retornar la respuesta exitosa con los artículos encontrados en formato JSON
        return Response.ok().entity(j.toJson(articulos)).build();
      } finally {
        // Cerrar el ResultSet
        rs.close();
      }
    } catch (Exception e) {
      // Manejo de excepciones y retorno de un error
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      // Asegurarse de cerrar la conexión a la base de datos
      conexion.close();
    }
  }

  @POST
  @Path("realizar_compra")
  @Consumes(MediaType.APPLICATION_JSON)
  @Produces(MediaType.APPLICATION_JSON)
  public Response realizarCompra() throws Exception {
    // Establecer la conexión a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Comenzamos la transacción
      conexion.setAutoCommit(false);

      // Verificar si hay artículos en el carrito
      String sqlVerCarrito = "SELECT id_articulo, cantidad FROM carrito_compra";
      PreparedStatement stmtVerCarrito = conexion.prepareStatement(sqlVerCarrito);
      ResultSet rsCarrito = stmtVerCarrito.executeQuery();

      // Lista para almacenar los artículos del carrito
      ArrayList<CarritoItem> carritoItems = new ArrayList<>();
      while (rsCarrito.next()) {
        CarritoItem item = new CarritoItem();
        item.id_articulo = rsCarrito.getInt("id_articulo");
        item.cantidad = rsCarrito.getInt("cantidad");
        carritoItems.add(item);
      }

      if (carritoItems.isEmpty()) {
        return Response.status(400).entity(j.toJson(new Error("El carrito está vacío"))).build();
      }

      // Verificar si la cantidad de artículos en el carrito está disponible en
      // inventario
      for (CarritoItem item : carritoItems) {
        String sqlVerificarInventario = "SELECT cantidad FROM articulos WHERE id_articulo = ?";
        PreparedStatement stmtVerificarInventario = conexion.prepareStatement(sqlVerificarInventario);
        stmtVerificarInventario.setInt(1, item.id_articulo);
        ResultSet rsInventario = stmtVerificarInventario.executeQuery();

        if (rsInventario.next()) {
          int cantidadDisponible = rsInventario.getInt("cantidad");

          // Si no hay suficiente cantidad, revertir la transacción y retornar un error
          if (item.cantidad > cantidadDisponible) {
            return Response.status(400)
                .entity(j.toJson(new Error("No hay suficiente cantidad del artículo con ID: " + item.id_articulo)))
                .build();
          }

          // Restar la cantidad del inventario
          String sqlActualizarInventario = "UPDATE articulos SET cantidad = cantidad - ? WHERE id_articulo = ?";
          PreparedStatement stmtActualizarInventario = conexion.prepareStatement(sqlActualizarInventario);
          stmtActualizarInventario.setInt(1, item.cantidad);
          stmtActualizarInventario.setInt(2, item.id_articulo);
          stmtActualizarInventario.executeUpdate();
        } else {
          return Response.status(400)
              .entity(j.toJson(new Error("El artículo con ID: " + item.id_articulo + " no existe en el inventario")))
              .build();
        }
      }

      // Eliminar los artículos del carrito
      String sqlEliminarCarrito = "DELETE FROM carrito_compra";
      PreparedStatement stmtEliminarCarrito = conexion.prepareStatement(sqlEliminarCarrito);
      stmtEliminarCarrito.executeUpdate();

      // Confirmar la transacción
      conexion.commit();

      // Responder con código 200 para indicar éxito sin necesidad de un mensaje
      // adicional
      return Response.ok().build();

    } catch (Exception e) {
      // En caso de error, revertir la transacción
      conexion.rollback();
      return Response.status(400).entity(j.toJson(new Error("Error al realizar la compra: " + e.getMessage()))).build();
    } finally {
      // Asegurarse de restaurar el auto-commit y cerrar la conexión
      conexion.setAutoCommit(true);
      conexion.close();
    }
  }

  @GET
  @Path("lista_articulos_not_empty")
  @Produces(MediaType.APPLICATION_JSON)
  public Response listaArticulosNotEmpty() throws Exception {
    // Establecer la conexión a la base de datos
    Connection conexion = pool.getConnection();

    try {
      // Preparar la consulta SQL para obtener todos los artículos que tengan al menos
      // 1 en cantidad
      PreparedStatement stmt_1 = conexion.prepareStatement(
          "SELECT a.id_articulo, a.nombre, a.descripcion, a.precio, a.cantidad, b.foto " +
              "FROM articulos a " +
              "LEFT OUTER JOIN fotos_articulos b ON a.id_articulo = b.id_articulo " +
              "WHERE a.cantidad > 0"); // Aquí estamos filtrando por cantidad mayor a 0

      try {
        // Ejecutar la consulta
        ResultSet rs = stmt_1.executeQuery();
        try {
          // Crear una lista para almacenar los artículos
          ArrayList<Articulo> articulos = new ArrayList<>();

          // Iterar sobre los resultados de la consulta
          while (rs.next()) {
            // Crear el objeto Articulo para mapear los resultados
            Articulo articulo = new Articulo();
            articulo.id_articulo = rs.getInt(1); // Asignar el ID del artículo
            articulo.nombre = rs.getString(2); // Asignar el nombre del artículo
            articulo.descripcion = rs.getString(3); // Asignar la descripción
            articulo.precio = rs.getFloat(4); // Asignar el precio
            articulo.cantidad = rs.getInt(5); // Asignar la cantidad
            articulo.foto = rs.getBytes(6); // Asignar la foto como byte[]

            // Agregar el artículo a la lista
            articulos.add(articulo);
          }

          // Retornar la respuesta exitosa con la lista de artículos en formato JSON
          return Response.ok().entity(j.toJson(articulos)).build();
        } finally {
          // Cerrar el ResultSet
          rs.close();
        }
      } finally {
        // Cerrar el PreparedStatement
        stmt_1.close();
      }
    } catch (Exception e) {
      // Manejo de excepciones y retorno de un error
      return Response.status(400).entity(j.toJson(new Error(e.getMessage()))).build();
    } finally {
      // Asegurarse de cerrar la conexión a la base de datos
      conexion.close();
    }
  }

}
