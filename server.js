const express = require('express')
const app = express()
const port = 5000
const logger = require("morgan");
const bodyParser = require("body-parser");
const { v4 } = require("uuid");
const { createClient  } = require("redis");

// Redis Connection
const client = createClient();

async function connectRedis(){
    await client.connect();
    client.on('error', err => console.log('Redis Client Error', err));
}

app.use(logger("dev"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

app.get('/', async (req, res) => {
    const { cookie } = req.headers; // get the cookie
    // here if the cookie exist it will contain the
    // id of the authentication other ways it will be
    // a null value then we will set it up

    if(!cookie){
        // when the cookie doesn't exist
        //* generate a random id
        const auth_id = v4();
        const name = `uc:${auth_id}`;

        //* save in redis and set the experation dates (uc = user connection)
        connectRedis();
        await client.set(name,"hello how are you");
        await client.expire(name,40);

        //* then add the id to res.cookie  
        res.cookie("uc",auth_id);
    }else{  
        const auth_id = cookie.split("=")[1];
        console.log(await client.get(`uc:${auth_id}`));
    }

    res.send(cookie);
})

app.listen(port, () => {
    console.log(`Cookie Setter listening on port ${port}`)
})

