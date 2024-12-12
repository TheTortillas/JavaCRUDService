import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

const HttpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    Accept: 'application/json',
  }),
};

// Define la interfaz para los productos
export interface Product {
  id_articulo?: number;
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
  providedIn: 'root',
})
export class ProductsService {
  private URLBase = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getProduct(name: string): Observable<Product | ErrorResponse> {
    const url = this.URLBase + '/consulta_articulo';
    const body = { nombre: name };
    return this.httpClient.post<Product | ErrorResponse>(
      url,
      body,
      HttpOptions
    );
  }

  getAllProducts(): Observable<Product[]> {
    const url = this.URLBase + '/lista_articulos'; // La URL del endpoint en el backend
    return this.httpClient.get<Product[]>(url, HttpOptions); // Obtenemos la lista de productos
  }

  getAllProductsNotEmpty(): Observable<Product[]> {
    const url = this.URLBase + '/lista_articulos_not_empty'; // La URL del endpoint en el backend
    return this.httpClient.get<Product[]>(url, HttpOptions); // Obtenemos la lista de productos
  }

  addProduct(product: Product): Observable<Product | ErrorResponse | null> {
    const url = this.URLBase + '/alta_articulo';
    const body = { articulo: product };
    return this.httpClient.post<Product | ErrorResponse | null>(
      url,
      body,
      HttpOptions
    );
  }

  // Método para actualizar el artículo
updateProduct(product: Product): Observable<Product | ErrorResponse | null> {
  const url = this.URLBase + '/modifica_articulo';
  const body = { articulo: product };
  return this.httpClient.post<Product | ErrorResponse | null>(
    url,
    body,
    HttpOptions
  );
}

  deleteProduct(id_articulo: number): Observable<void | ErrorResponse> {
    const url = this.URLBase + '/borra_articulo'; // La URL del endpoint en el backend
    const body = { id_articulo: id_articulo }; // Enviamos el id del artículo a borrar
    return this.httpClient.post<void | ErrorResponse>(url, body, HttpOptions); // Hacemos una solicitud POST
  }

  addToCart(
    id_articulo: number,
    cantidad: number
  ): Observable<void | ErrorResponse> {
    const url = this.URLBase + '/agregar_al_carrito';
    const body = { id_articulo: id_articulo, cantidad: cantidad };
    return this.httpClient.post<void | ErrorResponse>(url, body, HttpOptions);
  }

  quitFromCart(id_articulo: number): Observable<void | ErrorResponse> {
    const url = this.URLBase + '/eliminar_del_carrito';
    const body = { id_articulo: id_articulo };
    return this.httpClient.post<void | ErrorResponse>(url, body, HttpOptions);
  }

  getCart(): Observable<Product[]> {
    const url = this.URLBase + '/ver_carrito';
    return this.httpClient.get<Product[]>(url, HttpOptions);
  }

  searchProducts(term: string): Observable<Product[]> {
    const url = `${
      this.URLBase
    }/buscar_articulos_SELECT_CON_LIKE?search=${encodeURIComponent(term)}`;
    return this.httpClient.get<Product[]>(url, HttpOptions);
  }

  // Método para obtener la cantidad disponible de un producto
  getProductQuantity(id_articulo: number): Observable<number> {
    const url = `${
      this.URLBase
    }/obtener_cantidad_disponible?id_articulo=${encodeURIComponent(
      id_articulo
    )}`;
    return this.httpClient.get<number>(url);
  }

  // Método para realizar la compra
  realizarCompra(): Observable<void | ErrorResponse> {
    const url = this.URLBase + '/realizar_compra'; // La URL del endpoint en el backend
    return this.httpClient.post<void | ErrorResponse>(url, {}, HttpOptions); // Realiza una solicitud POST sin cuerpo
  }
}
