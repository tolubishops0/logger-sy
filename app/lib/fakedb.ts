export interface Admin {
    name: string;
    email: string;
    avatar: string;
    role: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive" | "suspended";
    joined: string;
    lastSeen: string;
    location: string;
    posts: number;
}

const USERS: User[] = [
    { id: 1, name: "Kwame Mensah", email: "kwame@users.com", role: "Researcher", status: "active", joined: "Jan 2022", lastSeen: "2 hours ago", location: "Accra, GH", posts: 142 },
    { id: 2, name: "Amadou Diallo", email: "amadou@users.com", role: "Engineer", status: "active", joined: "Mar 2021", lastSeen: "5 mins ago", location: "Dakar, SN", posts: 389 },
    { id: 7, name: "Tolu Bishops", email: "tolu@users.com", role: "Engineer", status: "active", joined: "May 2024", lastSeen: "10 mins ago", location: "Ibadan, NG", posts: 96 },
    { id: 3, name: "Sophie Dubois", email: "sophie@users.com", role: "Engineer", status: "inactive", joined: "Jul 2023", lastSeen: "3 days ago", location: "Lyon, FR", posts: 57 },
    { id: 5, name: "Aïcha Traoré", email: "aicha@users.com", role: "Researcher", status: "suspended", joined: "Feb 2023", lastSeen: "2 weeks ago", location: "Abidjan, CI", posts: 12 },
    { id: 6, name: "Jean-Luc Martin", email: "jeanluc@users.com", role: "Researcher", status: "active", joined: "Aug 2021", lastSeen: "30 mins ago", location: "Paris, FR", posts: 774 },
];

export const getUsers = (): Promise<{ users: User[] }> =>
    new Promise((resolve) =>
        setTimeout(() => resolve({ users: USERS }), 1500)
    );

export const getUserById = (id: number): Promise<{ user: User }> =>
    new Promise((resolve, reject) =>
        setTimeout(() => {
            const user = USERS.find((u) => u.id === id);
            if (user) resolve({ user });
            else reject(new Error(`User ${id} not found`));
        }, 1000)
    );

export const getUsersBroken = (): Promise<{ success: boolean }> =>
    new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 1500) // forgot users field
    );

export const getUsersSlow = (): Promise<{ users: User[] }> =>
    new Promise((resolve) =>
        setTimeout(() => resolve({ users: USERS }), 6000)
    );