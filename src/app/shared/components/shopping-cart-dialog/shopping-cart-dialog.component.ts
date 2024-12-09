import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProductsService, Product } from '../../../services/products.service';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-shopping-cart-dialog',
  standalone: true,
  imports: [ CommonModule, MatTableModule, MatButtonModule, MatDialogModule, MatIconModule ],
  templateUrl: './shopping-cart-dialog.component.html',
  styleUrl: './shopping-cart-dialog.component.scss'
})
export class ShoppingCartDialogComponent implements OnInit {
  dataSource = new MatTableDataSource<Product>();

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
        alert('Compra realizada con éxito');
        this.dialogRef.close();
        this.loadCart(); // Recargar el carrito después de la compra
      },
      error: (err) => {
        console.error('Error al realizar la compra:', err);
        alert('Hubo un error al realizar la compra. Inténtalo de nuevo.');
      }
    });
  }
}