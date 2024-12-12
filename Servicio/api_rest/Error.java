/*
  Error.java
  Permite regresar al cliente REST un mensaje de error
  Carlos Pineda Guerrero, septiembre 2024
*/

package api_rest;

public class Error
{
	String message;

	Error(String message)
	{
		this.message = message;
	}
}
