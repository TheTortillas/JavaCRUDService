import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

const HttpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'
  })
};

// Define interfaces para los datos
export interface Usuario {
  email: string;
  nombre: string;
  apellido_paterno: string;
  apellido_materno?: string;
  fecha_nacimiento: string; // Usualmente se maneja como string en JSON
  telefono?: number;
  genero?: string;
  foto?: string; // Base64 o URL de la foto
}

export interface ErrorResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  /**
   * Consulta un usuario por su email.
   * @param email El email del usuario a consultar.
   * @returns Un Observable que contiene el Usuario o un ErrorResponse.
   */
  consultaUsuario(email: string): Observable<Usuario | ErrorResponse> {
    const url = this.URLBase + '/consulta_usuario';
    const body = { email: email };

    return this.httpClient.post<Usuario | ErrorResponse>(url, body, HttpOptions);
  }

  altaUsuario(user: Usuario): Observable<Usuario | ErrorResponse> {
    const url = this.URLBase + '/alta_usuario';
    const body = { usuario: user };

    return this.httpClient.post<Usuario | ErrorResponse>(url, body, HttpOptions);
  }
}

  // public postClima(newClima : any) : Observable<any> {
  //   return this.httpClient.post('http://localhost:5299/WeatherForecast', JSON.stringify(newClima), HttpOptions);
  // }
