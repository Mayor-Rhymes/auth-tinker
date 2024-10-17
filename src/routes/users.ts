import { Hono } from "hono";


const users = new Hono();

users.get('/signup', (c) => {
    
    return c.json({message: "Signup here"});

})

export default users;

