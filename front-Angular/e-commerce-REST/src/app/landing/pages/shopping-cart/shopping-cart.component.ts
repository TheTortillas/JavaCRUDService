import { ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { HomeButtonComponent } from "../../../shared/components/home-button/home-button.component";
import { MatButtonModule } from '@angular/material/button';
import { MatFormField } from '@angular/material/form-field';
import { MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../services/products.service';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { ShoppingCartDialogComponent } from '../../../shared/components/shopping-cart-dialog/shopping-cart-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

export interface Product {
  id_articulo: number;
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  foto: string;
}

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [HomeButtonComponent, MatButtonModule, MatFormField, MatLabel, 
    MatIconModule, MatInputModule, MatFormFieldModule, FormsModule, CommonModule, 
    MatSelectModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.Default,
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  
  products: Product[] = [];
  dataSource = new MatTableDataSource<Product>();
  searchTerm: string = ''; // Variable para almacenar el término de búsqueda

  constructor(private productsService: ProductsService, private dialog: MatDialog) {}
  
  ngOnInit(): void {
    console.log('ngOnInit called');
    this.loadProducts();
  }

  loadProducts(): void {
    console.log('loadProducts called');
    this.productsService.getAllProductsNotEmpty().subscribe({
      next: (products) => {
        console.log('Products loaded:', products);
        this.products = products.map(product => ({
          ...product,
          id_articulo: product.id_articulo ?? 0, // Asigna un valor predeterminado si es undefined
          foto: 'data:image/png;base64,' + product.foto
        }));
  
        // Asigna una nueva referencia al dataSource.data
        this.dataSource.data = [...this.products]; // Actualiza dataSource con una nueva instancia
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  // Método que se llama al escribir en el campo de búsqueda
  onSearchChange(searchTerm: string): void {
    this.searchTerm = searchTerm;
    
    if (this.searchTerm.trim() === '') {
      this.loadProducts();  // Si no hay búsqueda, cargar todos los productos
    } else {
      this.searchProducts(); // Llamar a la función de búsqueda
    }
  }

  // Llamar al servicio para buscar productos
  searchProducts(): void {
    this.productsService.searchProducts(this.searchTerm).subscribe({
      next: (products) => {
        console.log('Productos encontrados:', products);
        this.products = products.map(product => ({
          ...product,
          id_articulo: product.id_articulo ?? 0,
          foto: 'data:image/png;base64,' + product.foto
        }));
        this.dataSource.data = [...this.products]; // Actualiza dataSource con los resultados
      },
      error: (err) => {
        console.error('Error al buscar productos:', err);
      }
    });
  }

  getQuantityOptions(max: number): number[] {
    return Array.from({ length: max }, (_, i) => max - i);
  }

  addToCart(product: Product): void {
    if (product.cantidad <= 0) {
      Swal.fire('Error', 'La cantidad debe ser mayor a 0', 'error');
      return;
    }
  
    // Primero, obtenemos la cantidad disponible del producto en el inventario
    this.productsService.getProductQuantity(product.id_articulo).subscribe({
      next: (cantidadDisponible) => {
        console.log(`Cantidad solicitada: ${product.cantidad}, Cantidad disponible: ${cantidadDisponible}`);
        
        // Verificar si el producto ya está en el carrito
        this.productsService.getCart().subscribe({
          next: (cartItems) => {
            // Buscar si el artículo ya está en el carrito
            const itemEnCarrito = cartItems.find(item => item.id_articulo === product.id_articulo);
            let cantidadEnCarrito = 0;
  
            if (itemEnCarrito) {
              cantidadEnCarrito = itemEnCarrito.cantidad;
            }
  
            // Verificar si la cantidad total (en carrito + solicitada) excede la cantidad disponible
            const cantidadTotal = cantidadEnCarrito + product.cantidad;
  
            if (cantidadTotal > cantidadDisponible) {
              Swal.fire('Error', `No puedes añadir más de ${ cantidadEnCarrito} unidades de este producto al carrito.`, 'error');
              return;
            }
  
            // Si la cantidad es válida, procedemos a añadirlo al carrito
            console.log(`Añadido al carrito: ${product.nombre}, Cantidad: ${product.cantidad}`);
            this.productsService.addToCart(product.id_articulo, product.cantidad).subscribe({
              next: () => {
                Swal.fire('Éxito', 'Producto añadido al carrito', 'success');
                this.loadProducts();  // Actualizamos el estado del carrito
              },
              error: (err) => {
                console.error('Error al añadir el producto al carrito:', err);
                Swal.fire('Error', 'Hubo un error al añadir el producto al carrito. Inténtalo de nuevo.', 'error');
              }
            });
          },
          error: (err) => {
            console.error('Error al obtener los productos del carrito:', err);
            Swal.fire('Error', 'Hubo un error al verificar los productos en el carrito. Inténtalo de nuevo.', 'error');
          }
        });
      },
      error: (err) => {
        console.error('Error al obtener la cantidad disponible:', err);
        Swal.fire('Error', 'Hubo un error al verificar la cantidad disponible. Inténtalo de nuevo.', 'error');
      }
    });
  }
  
  openCartDialog(): void {
    const dialogRef = this.dialog.open(ShoppingCartDialogComponent, {
      width: '600px',
      data: { products: this.products }
    });

    dialogRef.componentInstance.purchaseCompleted.subscribe(() => {
      this.loadProducts(); // Recargar los productos después de la compra
    });
  }
}