export interface User {
    userName: string;
    token: string;
    roles: string[];
    displayName?: string;
    pictureUrl?: string | null;
}

