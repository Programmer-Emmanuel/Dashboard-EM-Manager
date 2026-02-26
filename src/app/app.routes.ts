import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path : '',
        loadComponent : ()=> import('./pages/home/home')
    },
    {
        path : 'connexion',
        loadComponent : ()=> import('./pages/connexion/connexion')
    },
    {
        path : 'apropos',
        loadComponent : ()=> import('./pages/apropos/apropos')
    },
    {
        path : 'dashboard',
        loadComponent : ()=> import('./pages/dashboard/dashboard'),
        children : [
            {
                path : '',
                pathMatch : 'full',
                redirectTo : 'accueil',
            },
            {
                path : 'accueil',
                loadComponent : ()=> import('./components/admin/accueil/accueil')
            },
            {
                path : 'profil',
                loadComponent : ()=>import('./components/admin/profil/profil')
            },
            {
                path: 'entreprises',
                loadComponent: ()=> import('./components/admin/entreprise/entreprise')
            },
            {
                path: 'admins',
                loadComponent : ()=> import('./components/admin/admin/admin')
            },
        ]
    },
    {
        path: '**',
        pathMatch : 'full',
        redirectTo : '404'
    },
    {
        path : '404',
        loadComponent : ()=> import('./pages/not-found/not-found')
    }
];
 