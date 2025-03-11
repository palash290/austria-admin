import { Routes } from '@angular/router';
import { RootComponent } from './components/main/root/root.component';
import { AuthGuard } from './guard/auth.guard';

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
                    import('./components/main/dashboard/dashboard.component').then(m => m.DashboardComponent), canActivate: [AuthGuard]
            },
            { path: 'bus-list', loadComponent: () => import('./components/main/bus-list/bus-list.component').then(m => m.BusListComponent), canActivate: [AuthGuard] },
            { path: 'my-drivers', loadComponent: () => import('./components/main/my-drivers/my-drivers.component').then(m => m.MyDriversComponent), canActivate: [AuthGuard] },
            { path: 'my-profile', loadComponent: () => import('./components/main/my-profile/my-profile.component').then(m => m.MyProfileComponent), canActivate: [AuthGuard] },
            { path: 'change-password', loadComponent: () => import('./components/main/change-password/change-password.component').then(m => m.ChangePasswordComponent), canActivate: [AuthGuard] },
            { path: 'all-users', loadComponent: () => import('./components/main/all-users/all-users.component').then(m => m.AllUsersComponent), canActivate: [AuthGuard] },
            { path: 'routes-management', loadComponent: () => import('./components/main/routes-management/routes-management.component').then(m => m.RoutesManagementComponent), canActivate: [AuthGuard] },
            { path: 'bus-schedule', loadComponent: () => import('./components/main/bus-schedule/bus-schedule.component').then(m => m.BusScheduleComponent), canActivate: [AuthGuard] },
            { path: 'all-bus-schedule', loadComponent: () => import('./components/main/all-bus-schedule/all-bus-schedule.component').then(m => m.AllBusScheduleComponent), canActivate: [AuthGuard] },
            { path: 'booking-management', loadComponent: () => import('./components/main/booking-management/booking-management.component').then(m => m.BookingManagementComponent), canActivate: [AuthGuard] },
            { path: 'terminal-management', loadComponent: () => import('./components/main/terminal-management/terminal-management.component').then(m => m.TerminalManagementComponent), canActivate: [AuthGuard] },
            { path: 'contact-us', loadComponent: () => import('./components/main/contact-us/contact-us.component').then(m => m.ContactUsComponent), canActivate: [AuthGuard] },
            { path: 'out-of-service', loadComponent: () => import('./components/main/out-of-service/out-of-service.component').then(m => m.OutOfServiceComponent), canActivate: [AuthGuard] },
            { path: 'category-management', loadComponent: () => import('./components/main/category-management/category-management.component').then(m => m.CategoryManagementComponent), canActivate: [AuthGuard] },
            { path: 'new-route', loadComponent: () => import('./components/main/routes-management/new-route/new-route.component').then(m => m.NewRouteComponent), canActivate: [AuthGuard] },
            { path: 'edit-city', loadComponent: () => import('./components/main/routes-management/edit-city/edit-city.component').then(m => m.EditCityComponent), canActivate: [AuthGuard] },
            { path: 'price-management', loadComponent: () => import('./components/main/price-management/price-management.component').then(m => m.PriceManagementComponent), canActivate: [AuthGuard] },
            { path: 'add-booking', loadComponent: () => import('./components/main/booking-management/add-booking/add-booking.component').then(m => m.AddBookingComponent), canActivate: [AuthGuard] },
            { path: 'booking-details', loadComponent: () => import('./components/main/booking-details/booking-details.component').then(m => m.BookingDetailsComponent), canActivate: [AuthGuard] },
            //category-management
            // { path: 'sellerShipment/:offerId/:sellerId/:buyerId', loadComponent: () => import('./components/user/seller-shipment-status/seller-shipment-status.component').then(m => m.SellerShipmentStatusComponent), canActivate: [AuthGuard] },
            // { path: 'user-profile/:id', loadComponent: () => import('./components/user/user-profile/user-profile.component').then(m => m.UserProfileComponent) },
            // { path: 'terms', loadComponent: () => import('./components/help/terms-conditions/terms-conditions.component').then(m => m.TermsConditionsComponent) },
            // { path: 'accounts', loadComponent: () => import('./components/user/user-account/user-account.component').then(m => m.UserAccountComponent), canActivate: [AuthGuard] },
        ]
    },
];
