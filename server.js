const express = require('express');
const server = express();

server.use(express.static('./'))

server.listen(3000, () => {
   console.log('server up and running on port 3000');
})