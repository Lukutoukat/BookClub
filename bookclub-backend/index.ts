import express from 'express';
const app = express();

app.use(express.static('dist'))

app.get('/ping', (_req, res) => {
  res.send('pong');
});

app.get('/', (_req, res) => {
  res.send('<h1>Hello World!<h1>')
})

app.get('/api/books', (_req, res) => {
  res.send([
    { content: 'book1' },
    { content: 'book2' },
    { content: 'book3' }
  ])

  console.log('smth happened in backend')
})
const PORT = 3003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
