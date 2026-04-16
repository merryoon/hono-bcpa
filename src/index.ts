import { Hono } from 'hono';

const app = new Hono();
// User Types

type User = {
    id: string;
    name: string;
    email: string;
    password:string;
};

// In-Memory User Store
const users: User[] = [];

const addUser = (user: User) => {
    users.push(user);
};

const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id);
};

const getAllUsers = (): User[] => {
    return users;
};

//api
app.get('/',(c)=>{
    return c.text( 'assignment ');
})
// Get all users
app.get('/users', (c) => {
    const Users = getAllUsers().map(({ password, ...rest }) => rest);
    return c.json(Users);
});

//  Get User by ID
app.get('/users/:id', (c) => {
    const id = c.req.param('id');
    const user = getUserById(id);

    if (!user) {
        return c.json({ error: "User not found" }, 404);
    }

    const { password, ...safeUser } = user;
    return c.json(safeUser);
});

//  Signup
app.post('/signup', async (c) => {
    const { name, email, password } = await c.req.json();

    if (!name || !email || !password) {
        return c.json({ error: "Name, email, and password are required" }, 400);
    }

    if (users.find(u => u.email === email)) {
        return c.json({ error: "Email already exists" }, 409);
    }

    const newUser: User = {
        id: crypto.randomUUID(),
        name,
        email,
        password
    };

    addUser(newUser);

    const { password: _, ...userResponse } = newUser;
    return c.json(userResponse, 201);
});

//  Signin
app.post('/signin', async (c) => {
    const { email, password } = await c.req.json();

    const user = users.find(u => u.email === email);

    
    if (!user || user.password !== password) {
        return c.json({ error: "Invalid email or password" }, 401);
    }

    const { password: _, ...userResponse } = user;
    return c.json({
        message: "Login successful",
        user: userResponse
    });
});

export default app;
