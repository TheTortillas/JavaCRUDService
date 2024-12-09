import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { HomeButtonComponent } from '../../../shared/components/home-button/home-button.component';
import {
  ErrorResponse,
  UserService,
  Usuario,
} from '../../../services/user.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ProductsService } from '../../../services/products.service';
import { CommonModule } from '@angular/common';

export interface Product {
  nombre: string;
  descripcion: string;
  precio: number;
  cantidad: number;
  foto: string;
}


@Component({
  selector: 'app-manage-articles',
  standalone: true,
  imports: [
    HomeButtonComponent,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    MatTooltipModule,
    CommonModule
  ],
  templateUrl: './manage-articles.component.html',
  styleUrl: './manage-articles.component.scss',
})
export class ManageArticlesComponent implements AfterViewInit {
  // Declaramos las variables necesarias
  displayedColumns: string[] = ['index', 'name', 'price', 'quantity',  'delete'];

  dataSource = new MatTableDataSource<Product>();
  foto: string | null = null; // Para guardar la foto en base64
  isAddingArticle: boolean = false; // Para habilitar/deshabilitar el formulario
  isEditingArticle: boolean = false; // Para habilitar/deshabilitar el formulario

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  // Inyectamos el servicio ProductsService
  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.fetchProducts();  // Llamamos a fetchProducts para obtener los datos cuando el componente se inicialice
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  editProduct(product: Product): void {
    console.log('Edit product:', product);
  }

  deleteProduct(product: Product): void {
    console.log('Delete product:', product);
  }

  enableAddArticle(imageElement: HTMLImageElement): void {
    this.isAddingArticle = true;
    this.clearInputs();
    imageElement.src = 'https://dummyimage.com/600x400/000/fff';
  }

  enableEditArticle(articulo: Product, imageElement: HTMLImageElement): void {
    this.isEditingArticle = true;
    this.isAddingArticle = false;

    // Rellenar los campos con los datos del producto
    (document.getElementById('nombre') as HTMLInputElement).value = articulo.nombre;
    (document.getElementById('descripcion') as HTMLTextAreaElement).value = articulo.descripcion;
    (document.getElementById('precio') as HTMLInputElement).value = articulo.precio.toString();
    (document.getElementById('cantidad') as HTMLInputElement).value = articulo.cantidad.toString();

    // Mostrar la imagen en base64
    imageElement.src = 'data:image/png;base64,' + articulo.foto;
    this.foto = articulo.foto;
  }

  cancelAddArticle(imageElement: HTMLImageElement): void {
    this.isAddingArticle = false;
    this.clearInputs();
    imageElement.src = 'https://dummyimage.com/600x400/000/fff';
  }

  cancelEditArticle(imageElement: HTMLImageElement): void {
    this.isEditingArticle = false;
    this.clearInputs();
    imageElement.src = 'https://dummyimage.com/600x400/000/fff';
  }

  clearInputs(): void {
    const inputs = document.querySelectorAll('input');
    const textareas = document.querySelectorAll('textarea');
    inputs.forEach(input => (input as HTMLInputElement).value = '');
    textareas.forEach(textarea => (textarea as HTMLTextAreaElement).value = '');
    this.foto = null;
  }

  onFileSelected(event: any, imageElement: HTMLImageElement) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        imageElement.src = reader.result as string;
        this.foto = (reader.result as string).split(',')[1];
        //console.log('Selected file:', file);
        //console.log('Base64 data:', this.foto);
      };
      reader.readAsDataURL(file);
    }
  }

   // Método para añadir el artículo
   addArticle(): void {
    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;
    const precio = parseFloat((document.getElementById('precio') as HTMLInputElement).value);
    const cantidad = parseInt((document.getElementById('cantidad') as HTMLInputElement).value, 10);

    // Validar que la foto esté cargada
    if (!this.foto) {
      alert('Por favor, seleccione una foto para el producto.');
      return;
    }
    
    // Validar que los campos obligatorios no estén vacíos
    if (!nombre || !descripcion || isNaN(precio) || isNaN(cantidad) || cantidad <= 0 || cantidad < 0) {
      alert('Por favor complete todos los campos correctamente.');
      return;
    }

    const newProduct: Product = {
      nombre,
      descripcion,
      precio,
      cantidad,
      foto: this.foto || '',
    };

    console.log('Objeto a enviar:', newProduct);  // Verifica que los datos sean correctos

    this.productsService.addProduct(newProduct).subscribe({
      next: (response) => {
        console.log('Respuesta del servidor:', response); // Para ver qué está devolviendo el backend
        if ('message' in response) {
          alert(`Error: ${response.message}`);
        } else {
          alert('Producto agregado correctamente');
          this.cancelAddArticle(document.getElementById('foto') as HTMLImageElement);
        }
      },
      error: (err) => {
        console.log('Error al agregar el artículo:', err);
        alert('Hubo un error al agregar el producto. Inténtalo de nuevo.');
      },
    });  
    
    this.fetchProducts();  // Actualiza la tabla con los nuevos datos
  }

  // Método para consultar un artículo
  getArticle(): void {
    const name = 'Lenovo LOQ 9na Gen (15 AMD) con RTX 4060'; 

    this.productsService.getProduct(name).subscribe({
      next: (response) => {
        if ((response as Product).nombre) {
          const articulo = response as Product;
          console.log('El articulo es:', articulo);
        } else {
          const errorResponse = response as ErrorResponse;
          console.error('Error al consultar articulo:', errorResponse.message);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud HTTP:', err);
      }
    });
  }

  fetchProducts(): void {
    this.productsService.getAllProducts().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          console.log('Datos recibidos:', response);  // Verifica que los datos sean correctos
          this.dataSource.data = response;  // Asigna los datos a la tabla
        }
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        alert('Hubo un error al cargar los productos.');
      }
    });
  }

  selectProduct(product: Product): void {
  this.productsService.getProduct(product.nombre).subscribe({
    next: (response) => {
      if ((response as Product).nombre) {
        const articulo = response as Product;
        console.log('El artículo es:', articulo);

        const imageElement = document.getElementById('foto') as HTMLImageElement;
        this.enableEditArticle(articulo, imageElement);
      } else {
        const errorResponse = response as ErrorResponse;
        console.error('Error al consultar artículo:', errorResponse.message);
      }
    },
    error: (err) => {
      console.error('Error en la solicitud HTTP:', err);
    }
  });
}

  getProduct(name: string): void {
    this.productsService.getProduct(name).subscribe({
      next: (response) => {
        if ((response as Product).nombre) {
          const articulo = response as Product;
          console.log('El artículo es:', articulo);
  
          // Enable the form for editing
          this.isAddingArticle = true;
  
          // Populate input fields with product data
          (document.getElementById('nombre') as HTMLInputElement).value = articulo.nombre;
          (document.getElementById('descripcion') as HTMLTextAreaElement).value = articulo.descripcion;
          (document.getElementById('precio') as HTMLInputElement).value = articulo.precio.toString();
          (document.getElementById('cantidad') as HTMLInputElement).value = articulo.cantidad.toString();
  
          // Display the image from base64
          const imageElement = document.getElementById('foto') as HTMLImageElement;
          imageElement.src = 'data:image/png;base64,' + articulo.foto;
          this.foto = articulo.foto;
  
        } else {
          const errorResponse = response as ErrorResponse;
          console.error('Error al consultar artículo:', errorResponse.message);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud HTTP:', err);
      }
    });
  }

  updateArticle(): void {
    const nombre = (document.getElementById('nombre') as HTMLInputElement).value;
    const descripcion = (document.getElementById('descripcion') as HTMLTextAreaElement).value;
    const precio = parseFloat((document.getElementById('precio') as HTMLInputElement).value);
    const cantidad = parseInt((document.getElementById('cantidad') as HTMLInputElement).value, 10);
  
    if (!this.foto) {
      alert('Por favor, seleccione una foto para el producto.');
      return;
    }
  
    if (!nombre || !descripcion || isNaN(precio) || isNaN(cantidad) || cantidad <= 0) {
      alert('Por favor complete todos los campos correctamente.');
      return;
    }
  
    const updatedProduct: Product = {
      nombre,
      descripcion,
      precio,
      cantidad,
      foto: this.foto || '',
    };
    
    console.log('Objeto a actualizar:', updatedProduct);

    this.productsService.updateProduct(updatedProduct).subscribe({
      next: (response) => {
        if ('message' in response) {
          alert(`Error: ${response.message}`);
        } else {
          alert('Producto actualizado correctamente');
          this.cancelEditArticle(document.getElementById('foto') as HTMLImageElement);
        }
      },
      error: (err) => {
        console.error('Error al actualizar el artículo:', err);
        alert('Hubo un error al actualizar el producto. Inténtalo de nuevo.');
      },
    });
  }
}