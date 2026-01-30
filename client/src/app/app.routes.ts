import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { MembersList } from '../features/members/members-list/members-list';
import { Messages } from '../features/messages/messages/messages';
import { Lists } from '../features/lists/lists/lists';
import { Register } from '../features/account/register/register';
import { SignIn } from '../features/account/sign-in/sign-in';
import { redirectToHomeIfNotLoggedInGuard, redirectToMembersIfLoggedInGaurd, } from '../core/gaurds/auth-guards';
import { NotFound } from '../features/not-found/not-found';
import { MemberDetails } from '../features/members/member-details/member-details';
import { MemberProfile } from '../features/members/member-profile/member-profile';
import { MemberMessages } from '../features/members/member-messages/member-messages';
import { MemberPhotos } from '../features/members/member-photos/member-photos';
import { memberResolver } from '../features/members/member-resolver';
import { preventUnsavedChangesGuard } from '../core/gaurds/prevent-unsaved-changes-guard';

export const routes: Routes = [

    { path: '', component: Home, canActivate: [redirectToMembersIfLoggedInGaurd] },
    { path: 'register', component: Register, title: 'Register' },
    { path: 'signin', component: SignIn, title: 'Signin' },

    {
        path: '',
        runGuardsAndResolvers: 'always',
        canActivate: [redirectToHomeIfNotLoggedInGuard],
        children: [
            { path: 'members', component: MembersList, title: 'Members' },
            {
                path: 'members/:id',
                component: MemberDetails,
                resolve: {member: memberResolver},
                runGuardsAndResolvers: 'always',
                children: [
                    { path: '', redirectTo: 'profile', pathMatch: 'full' },
                    { path: 'profile', component: MemberProfile, title: 'Profile', canDeactivate: [preventUnsavedChangesGuard] },
                    { path: 'messages', component: MemberMessages, title: 'Messages' },
                    { path: 'photos', component: MemberPhotos, title: 'Photos' },
                ]
            },
        ]
    },

    { path: 'messages', component: Messages, canActivate: [redirectToHomeIfNotLoggedInGuard], title: 'Messages' },
    { path: 'lists', component: Lists, canActivate: [redirectToHomeIfNotLoggedInGuard], title: 'Lists' },
    { path: 'notfound', component: NotFound, title: 'Not Found' },
    { path: '**', component: NotFound, title: 'Not Found' }
];
