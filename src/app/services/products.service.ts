import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

const HttpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json', 
    'Access-Control-Allow-Origin': '*',
    'Accept': 'application/json'    
  })
};

// Define la interfaz para los productos
export interface Product {
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  foto: string;
}

export interface ErrorResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getProduct(name: string): Observable<Product | ErrorResponse> {
    const url = this.URLBase + '/consulta_articulo';
    const body = { nombre: name };
    return this.httpClient.post<Product | ErrorResponse>(url, body, HttpOptions);
  }

  getAllProducts(): Observable<Product[]> {
    const url = this.URLBase + '/lista_articulos'; // La URL del endpoint en el backend
    return this.httpClient.get<Product[]>(url, HttpOptions);  // Obtenemos la lista de productos
  }

  addProduct(product: Product): Observable<Product | ErrorResponse> {
    const url = this.URLBase + '/alta_articulo';
    const body = { articulo: product };
    return this.httpClient.post<Product | ErrorResponse>(url, body, HttpOptions);
  }

  updateProduct(product: Product): Observable<Product | ErrorResponse> {  
    const url = this.URLBase + '/modifica_articulo';
    const body = { articulo: product };
    return this.httpClient.post<Product | ErrorResponse>(url, body, HttpOptions);
  }
}
