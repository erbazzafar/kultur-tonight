const express = require('express');
const userRouter = require('./Router/userRouter');

const app = express();
const port = process.env.PORT || 8010;

app.use(express.json());





app.get('/', (req, res) => {
  res.send('KT-Backend is running!');
})


app.use('/user', userRouter)

app.listen(port, () => {
  console.log(`KT-Backend running on port ${port}`);
});