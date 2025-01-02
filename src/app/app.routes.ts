import { Routes } from '@angular/router';
import { RootComponent } from './components/main/root/root.component';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/core/login/login.component').then(m => m.LoginComponent), pathMatch: 'full' },
    { path: 'forgot-password', loadComponent: () => import('./components/core/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    // { path: 'dashboard', loadComponent: () => import('./components/main/dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'data-filling', loadComponent: () => import('./components/main/bus-list/bus-list.component').then(m => m.BusListComponent) },

    {
        path: 'home',
        component: RootComponent,
        children: [
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./components/main/dashboard/dashboard.component').then(m => m.DashboardComponent)
            },
            { path: 'bus-list', loadComponent: () => import('./components/main/bus-list/bus-list.component').then(m => m.BusListComponent) },
            { path: 'my-drivers', loadComponent: () => import('./components/main/my-drivers/my-drivers.component').then(m => m.MyDriversComponent) },
            { path: 'my-profile', loadComponent: () => import('./components/main/my-profile/my-profile.component').then(m => m.MyProfileComponent) },
            { path: 'change-password', loadComponent: () => import('./components/main/change-password/change-password.component').then(m => m.ChangePasswordComponent) },
            { path: 'all-users', loadComponent: () => import('./components/main/all-users/all-users.component').then(m => m.AllUsersComponent) },
            // { path: 'product_details', loadComponent: () => import('./components/product-details/product-details.component').then(m => m.ProductDetailsComponent) },
            // { path: 'buyerShipment/:offerId/:sellerId/:buyerId', loadComponent: () => import('./components/user/buyer-shipment-status/buyer-shipment-status.component').then(m => m.BuyerShipmentStatusComponent), canActivate: [AuthGuard] },
            // { path: 'sellerShipment/:offerId/:sellerId/:buyerId', loadComponent: () => import('./components/user/seller-shipment-status/seller-shipment-status.component').then(m => m.SellerShipmentStatusComponent), canActivate: [AuthGuard] },
            // { path: 'user-profile/:id', loadComponent: () => import('./components/user/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
            // { path: 'terms', loadComponent: () => import('./components/help/terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent) },
            // { path: 'accounts', loadComponent: () => import('./components/user/user-account/user-account.component').then(m => m.UserAccountComponent), canActivate: [AuthGuard] },
        ]
    },
];
