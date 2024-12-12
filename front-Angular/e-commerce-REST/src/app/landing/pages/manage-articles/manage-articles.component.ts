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
import Swal from 'sweetalert2';

export interface Product {
  id_articulo?: number;
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
    CommonModule,
  ],
  templateUrl: './manage-articles.component.html',
  styleUrl: './manage-articles.component.scss',
})
export class ManageArticlesComponent implements AfterViewInit {
  // Declaramos las variables necesarias
  displayedColumns: string[] = ['index', 'name', 'price', 'quantity', 'delete'];

  dataSource = new MatTableDataSource<Product>();
  foto: string | null = null; // Para guardar la foto en base64
  isAddingArticle: boolean = false; // Para habilitar/deshabilitar el formulario
  isEditingArticle: boolean = false; // Para habilitar/deshabilitar el formulario
  current_id_product?: number;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  // Inyectamos el servicio ProductsService
  constructor(private productsService: ProductsService) {}

  ngOnInit(): void {
    this.fetchProducts(); // Llamamos a fetchProducts para obtener los datos cuando el componente se inicialice
  }

  ngAfterViewInit() {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  enableAddArticle(imageElement: HTMLImageElement): void {
    this.isAddingArticle = true;
    this.isEditingArticle = false;
    this.clearInputs();
    imageElement.src = 'https://dummyimage.com/600x400/000/fff';
  }

  enableEditArticle(articulo: Product, imageElement: HTMLImageElement): void {
    this.isEditingArticle = true;
    this.isAddingArticle = false;

    // Asignar id_articulo
    this.current_id_product = articulo.id_articulo;
    console.log('ID del producto seleccionado:', this.current_id_product); // Para verificar

    // Rellenar los campos con los datos del producto
    (document.getElementById('nombre') as HTMLInputElement).value =
      articulo.nombre;
    (document.getElementById('descripcion') as HTMLTextAreaElement).value =
      articulo.descripcion;
    (document.getElementById('precio') as HTMLInputElement).value =
      articulo.precio.toString();
    (document.getElementById('cantidad') as HTMLInputElement).value =
      articulo.cantidad.toString();

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
    inputs.forEach((input) => ((input as HTMLInputElement).value = ''));
    textareas.forEach(
      (textarea) => ((textarea as HTMLTextAreaElement).value = '')
    );
    this.foto = null;
  }

  onFileSelected(event: any, imageElement: HTMLImageElement) {
    const file: File = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        imageElement.src = reader.result as string;
        this.foto = (reader.result as string).split(',')[1];
        // console.log('Selected file:', file);
        // console.log('Base64 data:', this.foto);
      };
      reader.readAsDataURL(file);
    }
  }

  addArticle(): void {
    const nombre = (document.getElementById('nombre') as HTMLInputElement)
      .value;
    const descripcion = (
      document.getElementById('descripcion') as HTMLTextAreaElement
    ).value;
    const precioStr = (document.getElementById('precio') as HTMLInputElement)
      .value;
    const cantidadStr = (
      document.getElementById('cantidad') as HTMLInputElement
    ).value;

    const precio = parseFloat(precioStr);
    const cantidad = parseInt(cantidadStr, 10);

    // Validar que la foto esté cargada
    if (!this.foto) {
      Swal.fire(
        'Error',
        'Por favor, seleccione una foto para el producto.',
        'error'
      );
      return;
    }

    // Validar que los campos obligatorios no estén vacíos
    if (!nombre || !descripcion || !precioStr || !cantidadStr) {
      Swal.fire('Error', 'Por favor complete todos los campos.', 'error');
      return;
    }

    // Validar que la cantidad sea un entero positivo
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      Swal.fire(
        'Error',
        'La cantidad debe ser un número entero positivo.',
        'error'
      );
      return;
    }

    // Validar que el precio tenga como mucho dos decimales
    const precioDecimalPlaces = (precioStr.split('.')[1] || '').length;
    if (precio <= 0 || precioDecimalPlaces > 2) {
      Swal.fire(
        'Error',
        'El precio debe ser un número positivo con hasta dos decimales.',
        'error'
      );
      return;
    }

    const newProduct: Product = {
      nombre,
      descripcion,
      precio,
      cantidad,
      foto: this.foto || '',
    };

    console.log('Objeto a enviar:', newProduct); // Verifica que los datos sean correctos

    this.productsService.addProduct(newProduct).subscribe({
      next: (response) => {
        if (response && 'message' in response) {
          // Caso de error
          Swal.fire('Error', `Error: ${response.message}`, 'error');
        } else {
          // Caso de éxito
          Swal.fire('Éxito', 'Producto agregado correctamente', 'success');
          this.cancelAddArticle(
            document.getElementById('foto') as HTMLImageElement
          );
          this.fetchProducts(); // Mover aquí para que se ejecute solo en éxito
        }
      },
      error: (err) => {
        console.log('Error al agregar el artículo:', err);
        Swal.fire(
          'Error',
          'Hubo un error al agregar el producto. Inténtalo de nuevo.',
          'error'
        );
      },
    });
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
      },
    });
  }

  fetchProducts(): void {
    this.productsService.getAllProducts().subscribe({
      next: (response) => {
        if (Array.isArray(response)) {
          console.log('Datos recibidos:', response); // Verifica que los datos sean correctos
          this.dataSource.data = response; // Asigna los datos a la tabla
        }
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        Swal.fire('Error', 'Hubo un error al cargar los productos.', 'error');
      },
    });
  }

  selectProduct(product: Product): void {
    this.productsService.getProduct(product.nombre).subscribe({
      next: (response) => {
        if ((response as Product).nombre) {
          const articulo = response as Product;
          console.log('El artículo es:', articulo);

          const imageElement = document.getElementById(
            'foto'
          ) as HTMLImageElement;
          this.enableEditArticle(articulo, imageElement);
        } else {
          const errorResponse = response as ErrorResponse;
          console.error('Error al consultar artículo:', errorResponse.message);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud HTTP:', err);
      },
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
          (document.getElementById('nombre') as HTMLInputElement).value =
            articulo.nombre;
          (
            document.getElementById('descripcion') as HTMLTextAreaElement
          ).value = articulo.descripcion;
          (document.getElementById('precio') as HTMLInputElement).value =
            articulo.precio.toString();
          (document.getElementById('cantidad') as HTMLInputElement).value =
            articulo.cantidad.toString();

          // Display the image from base64
          const imageElement = document.getElementById(
            'foto'
          ) as HTMLImageElement;
          imageElement.src = 'data:image/png;base64,' + articulo.foto;
          this.foto = articulo.foto;
        } else {
          const errorResponse = response as ErrorResponse;
          console.error('Error al consultar artículo:', errorResponse.message);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud HTTP:', err);
      },
    });
  }

  updateArticle(): void {
    const nombre = (document.getElementById('nombre') as HTMLInputElement)
      .value;
    const descripcion = (
      document.getElementById('descripcion') as HTMLTextAreaElement
    ).value;
    const precioStr = (document.getElementById('precio') as HTMLInputElement)
      .value;
    const cantidadStr = (
      document.getElementById('cantidad') as HTMLInputElement
    ).value;

    const precio = parseFloat(precioStr);
    const cantidad = parseInt(cantidadStr, 10);

    if (!this.foto) {
      Swal.fire(
        'Error',
        'Por favor, seleccione una foto para el producto.',
        'error'
      );
      return;
    }

    if (
      !nombre ||
      !descripcion ||
      isNaN(precio) ||
      isNaN(cantidad) ||
      cantidad <= 0
    ) {
      Swal.fire(
        'Error',
        'Por favor complete todos los campos correctamente.',
        'error'
      );
      return;
    }

    // Validar que la cantidad sea un entero positivo
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      Swal.fire(
        'Error',
        'La cantidad debe ser un número entero positivo.',
        'error'
      );
      return;
    }

    // Validar que el precio tenga como mucho dos decimales
    const precioDecimalPlaces = (precioStr.split('.')[1] || '').length;
    if (precio <= 0 || precioDecimalPlaces > 2) {
      Swal.fire(
        'Error',
        'El precio debe ser un número positivo con hasta dos decimales.',
        'error'
      );
      return;
    }

    const updatedProduct: Product = {
      id_articulo: this.current_id_product,
      nombre,
      descripcion,
      precio,
      cantidad,
      foto: this.foto || '',
    };

    console.log('Objeto a actualizar:', updatedProduct);

    this.productsService.updateProduct(updatedProduct).subscribe({
      next: (response) => {
        if (response && 'message' in response) {
          // Caso de error
          Swal.fire('Error', `Error: ${response.message}`, 'error');
        } else {
          // Caso de éxito
          Swal.fire('Éxito', 'Producto actualizado correctamente', 'success');
          this.cancelEditArticle(
            document.getElementById('foto') as HTMLImageElement
          );
          this.fetchProducts(); // Mover aquí para que se ejecute solo en éxito
        }
      },
      error: (err) => {
        console.error('Error al actualizar el artículo:', err);
        Swal.fire(
          'Error',
          'Hubo un error al actualizar el producto. Inténtalo de nuevo.',
          'error'
        );
      },
    });
  }

  deleteProduct(product: Product): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Estás seguro de que deseas eliminar el producto: ${product.nombre}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.productsService.deleteProduct(product.id_articulo!).subscribe({
          next: () => {
            Swal.fire(
              'Eliminado',
              'Producto eliminado correctamente',
              'success'
            );
            this.clearInputs();
            this.isAddingArticle = false;
            this.isEditingArticle = false;
            const imageElement = document.getElementById(
              'foto'
            ) as HTMLImageElement;
            imageElement.src = 'https://dummyimage.com/600x400/000/fff'; // Restablecer la imagen a la predeterminada
            this.fetchProducts(); // Recargamos la lista de productos
          },
          error: (err) => {
            console.error('Error al eliminar el producto:', err);
            Swal.fire(
              'Error',
              'Hubo un error al eliminar el producto. Inténtalo de nuevo.',
              'error'
            );
          },
        });
      }
    });
  }
}
