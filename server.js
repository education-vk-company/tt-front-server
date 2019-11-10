const path = require('path');
const fs = require('fs');
const os = require('os');
const Koa = require('koa');
const mount = require('koa-mount');
const graphqlHTTP = require('koa-graphql');
const router = require('koa-router')();
const cors = require('@koa/cors');
const bodyParser = require('koa-body');
const Pug = require('koa-pug');
const schema = require('./graphql/schema');
const Prepod = require('./models/prepod');
const initDB = require('./database');

const readAndWriteFile = (file) => {
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
  reader.pipe(stream);
  console.log('uploading %s -> %s', file.name, stream.path);
  return stream;
}

initDB();

const app = new Koa();
app.use(cors());

const uploadsDir = path.resolve(__dirname, './uploads/');

const pug = new Pug({
  viewPath: path.resolve(__dirname, './views'),
  basedir: './views',
  app: app,
});

// app.use(bodyParser({
//   // formidable: { uploadDir: './uploads' },
//   multipart: true,
//   urlencoded: true
// }));

router.get('/', getPrepods);
router.post('/', addPrepod);

router.get('/prepods', getPrepods);
router.post('/prepods', addPrepod);

router.get('/prepods/:id', findPrepodById);

router.get('/files', renderForm);
router.post('/upload', bodyParser({
  multipart: true,
  urlencoded: true
}), handleForm);

app.use(mount('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
})));

async function renderForm(ctx) {
  console.log('files');
  await ctx.render('file_upload');
}

async function handleForm(ctx) {
  console.log('[handleForm body]', ctx.request.body);
  console.log('[handleForm files]', ctx.request.files);

  const { image, audio } = ctx.request.files;

  const response = {
    status: 'ok',
    image: false,
    audio: false,
  };

  if (image && image.size) {
    readAndWriteFile(image);
    response.image = true;
  }

  if (audio && audio.size) {
    readAndWriteFile(image);
    response.audio = true;
  }

  ctx.body = JSON.stringify(response);
  // ctx.redirect('/files');
}

async function getPrepods(ctx) {
  ctx.body = await Prepod.find()
}

async function findPrepodById(ctx) {
  try {
    const city = await Prepod.findById(ctx.params.id);
    if (!city) {
      ctx.throw(404);
    }
    ctx.body = city;
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.throw(404);
    }
    ctx.throw(500);
  }
}

async function addPrepod(ctx) {
  try {
    const city = await new Prepod(ctx.request.body).save();
    ctx.body = city;
  } catch (err) {
    ctx.throw(422);
  }
}

async function updatePrepod(ctx) {
  try {
    const city = await Prepod.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    if (!city) {
      ctx.throw(404);
    }
    ctx.body = city;
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.throw(404);
    }
    ctx.throw(500);
  }
}

app.use(router.routes());

app.listen(9000);
app.on('error', err => {
  console.error('[server error]', err);
});
