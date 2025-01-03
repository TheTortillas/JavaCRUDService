import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductsService, Product } from '../../../services/products.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shopping-cart-dialog',
  standalone: true,
  imports: [ CommonModule, MatTableModule, MatButtonModule, MatDialogModule, MatIconModule ],
  templateUrl: './shopping-cart-dialog.component.html',
  styleUrl: './shopping-cart-dialog.component.scss'
})
export class ShoppingCartDialogComponent implements OnInit {
  dataSource = new MatTableDataSource<Product>();
  @Output() purchaseCompleted = new EventEmitter<void>();

  constructor(
    public dialogRef: MatDialogRef<ShoppingCartDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { products: Product[] },
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.productsService.getCart().subscribe((products: Product[]) => {
      this.dataSource.data = products;
    });
  }

  getTotal(): number {
    return this.dataSource.data.reduce((acc, product) => acc + (product.precio * product.cantidad), 0);
  }

  removeFromCart(id_articulo: number): void {
    this.productsService.quitFromCart(id_articulo).subscribe(() => {
      this.dataSource.data = this.dataSource.data.filter(product => product.id_articulo !== id_articulo);
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  buy(): void {
    this.productsService.realizarCompra().subscribe({
      next: () => {
        Swal.fire('Éxito', 'Compra realizada con éxito', 'success');
        this.purchaseCompleted.emit(); // Emitir el evento de compra completada
        this.dialogRef.close();
      },
      error: (err) => {
        console.error('Error al realizar la compra:', err);
        Swal.fire('Error', 'Hubo un error al realizar la compra. Inténtalo de nuevo.', 'error');
      }
    });
  }
}