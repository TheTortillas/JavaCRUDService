import { Routes } from '@angular/router';
import { HomeComponent } from './landing/pages/home/home.component';
import { ShoppingCartComponent } from './landing/pages/shopping-cart/shopping-cart.component';
import { ManageArticlesComponent } from './landing/pages/manage-articles/manage-articles.component';

export const routes: Routes = [
    {
        path: 'home',
        component: HomeComponent,
    },

    {
        path: 'manage-articles',
        component: ManageArticlesComponent
    },
    
    {
        path: 'shopping-cart',
        component: ShoppingCartComponent
    },

    {
        path:'',
        redirectTo: 'home',
        pathMatch: 'full',
    },
    
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    }

];
