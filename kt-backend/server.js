const express = require('express');
const cors = require('cors');
const userRouter = require('./Router/userRouter');

const app = express();
const port = process.env.PORT || 8010;

app.use(express.json());


app.use(cors({
  origin: 'http://localhost:3000',   // frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true                  // if using cookies or auth headers
}));



app.get('/', (req, res) => {
  res.send('KT-Backend is running!');
})


app.use('/user', userRouter)

app.listen(port, () => {
  console.log(`KT-Backend running on port ${port}`);
});