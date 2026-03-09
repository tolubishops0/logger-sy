// ─────────────────────────────────────────────
//  FAKE DATABASE
//  All functions return promises with delays
//  to simulate real network requests
// ─────────────────────────────────────────────

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
    { id: 1, name: "Alan Turing", email: "alan@users.com", role: "Researcher", status: "active", joined: "Jan 2022", lastSeen: "2 hours ago", location: "London, UK", posts: 142 },
    { id: 2, name: "Linus Torvalds", email: "linus@users.com", role: "Engineer", status: "active", joined: "Mar 2021", lastSeen: "5 mins ago", location: "Portland, US", posts: 389 },
    { id: 3, name: "Margaret Hamilton", email: "margaret@users.com", role: "Engineer", status: "inactive", joined: "Jul 2023", lastSeen: "3 days ago", location: "Boston, US", posts: 57 },
    { id: 4, name: "Tim Berners-Lee", email: "tim@users.com", role: "Architect", status: "active", joined: "Nov 2020", lastSeen: "1 hour ago", location: "Geneva, CH", posts: 201 },
    { id: 5, name: "Hedy Lamarr", email: "hedy@users.com", role: "Researcher", status: "suspended", joined: "Feb 2023", lastSeen: "2 weeks ago", location: "Vienna, AT", posts: 12 },
    { id: 6, name: "Donald Knuth", email: "donald@users.com", role: "Researcher", status: "active", joined: "Aug 2021", lastSeen: "30 mins ago", location: "Stanford, US", posts: 774 },
];

// normal fetch — resolves in 1.5s
export const getUsers = (): Promise<{ users: User[] }> =>
    new Promise((resolve) =>
        setTimeout(() => resolve({ users: USERS }), 1500)
    );

// fetch a single user — resolves in 1s
export const getUserById = (id: number): Promise<{ user: User }> =>
    new Promise((resolve, reject) =>
        setTimeout(() => {
            const user = USERS.find((u) => u.id === id);
            if (user) resolve({ user });
            else reject(new Error(`User ${id} not found`));
        }, 1000)
    );

// broken fetch — returns wrong shape, simulating a bad API response
export const getUsersBroken = (): Promise<{ success: boolean }> =>
    new Promise((resolve) =>
        setTimeout(() => resolve({ success: true }), 1500) // forgot users field
    );

// slow fetch — takes 6 seconds
export const getUsersSlow = (): Promise<{ users: User[] }> =>
    new Promise((resolve) =>
        setTimeout(() => resolve({ users: USERS }), 10000)
    );