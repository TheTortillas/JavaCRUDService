import { Component } from '@angular/core';
import { HomeButtonComponent } from "../../../shared/components/home-button/home-button.component";
import { ErrorResponse, UserService, Usuario } from '../../../services/user.service';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [HomeButtonComponent, MatButtonModule],
  templateUrl: './shopping-cart.component.html',
  styleUrl: './shopping-cart.component.scss'
})
export class ShoppingCartComponent {

  constructor(private userService: UserService) {}

  consultarUsuario(): void {
    const email = 'sebas@gmail.com'; // Puedes reemplazar esto con el email que desees

    this.userService.consultaUsuario(email).subscribe({
      next: (response) => {
        if ((response as Usuario).email) {
          const usuario = response as Usuario;
          console.log('Usuario consultado mi:', usuario);
        } else {
          const errorResponse = response as ErrorResponse;
          console.error('Error al consultar usuario:', errorResponse.message);
        }
      },
      error: (err) => {
        console.error('Error en la solicitud HTTP:', err);
      }
    });
  }


  agregarUsuario(): void {
    const nuevoUsuario: Usuario = {
      email: 'marquez@gmail.com',
      nombre: 'Jose Antonio',
      apellido_paterno: 'Luna',
      apellido_materno: 'Marquez',
      fecha_nacimiento: '2000-01-01T00:00:00Z',
      telefono: 1234567890,
      genero: 'M',
      foto: ''
      // Agrega otros campos necesarios
    };
  
    this.userService.altaUsuario(nuevoUsuario).subscribe({
      next: (response) => {
        if (response && (response as Usuario).email) {
          const usuario = response as Usuario;
          console.log('Usuario agregado:', usuario);
        } else if (response) {
          const errorResponse = response as ErrorResponse;
          console.error('Error al agregar usuario:', errorResponse.message);
        } else {
          console.error('Error al agregar usuario: respuesta nula');
        }
      },
      error: (err) => {
        console.error('Error en la solicitud HTTP:', err);
      }
    });
  }
}
