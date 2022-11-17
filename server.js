const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const serveStatic = require('koa-static')
const Koa = require('koa');
const mount = require('koa-mount');
const graphqlHTTP = require('koa-graphql');
const router = require('koa-router')();
const cors = require('@koa/cors');
const bodyParser = require('koa-body');
const Pug = require('koa-pug');
const PassThrough = require('stream').PassThrough;
const schema = require('./graphql/schema');

const Message = require('./models/message');
const Prepod = require('./models/prepod');

const initDB = require('./database');
initDB();

const readAndWriteFile = (file) => {
  if (file) {
    const reader = fs.createReadStream(file.path);
    const fileName = file.name.split('.');
    const ext = fileName[fileName.length - 1];
    const newFileName = `${uuidv4()}.${ext}`;
    const stream = fs.createWriteStream(path.join(os.tmpdir(), newFileName));
    reader.pipe(stream);
    console.log('uploading %s -> %s', file.name, stream.path);
    return [stream, `https://tt-front.vercel.app/static/${newFileName}`];
  }
}

const app = new Koa();
app.use(cors());
app.use(mount('/static', serveStatic(os.tmpdir(), {})));

// const uploadsDir = path.resolve(__dirname, './uploads/');

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
router.get('/prepods/:id', findPrepodById);
router.post('/prepods', addPrepod);

router.get('/messages', getMessages);
router.get('/messages/:id', findMessageById);
router.get('/messages-sse', getMessagesSSE);
router.get('/messages-sse-view', renderMessages);
router.post('/message', bodyParser({urlencoded: true}), postMessage);

router.get('/files', renderForm);
router.post('/upload', bodyParser({
  multipart: true,
  urlencoded: true
}), handleForm);

app.use(mount('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true,
})));

async function postMessage(ctx) {
  try {
    ctx.body = await new Message(ctx.request.body).save();
  } catch (err) {
    ctx.throw(422);
  }
}

async function findMessageById(ctx) {
  try {
    const message = await Message.findById(ctx.params.id);
    if (!message) {
      ctx.throw(404);
    }
    ctx.body = message;
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.throw(404);
    }
    ctx.throw(500);
  }
}

async function getMessages(ctx) {
  ctx.body = await Message.find()
}

async function getMessagesSSE(ctx) {
  ctx.req.setTimeout(Number.MAX_VALUE);
  ctx.type = 'text/event-stream; charset=utf-8';
  ctx.set('Cache-Control', 'no-cache');
  ctx.set('Connection', 'keep-alive');
  ctx.status = 200;
  const stream = new PassThrough()
  ctx.body = stream;

  const cursor = Message.find().sort('-timestamp').limit(10).cursor()

  cursor
    .on('data', (doc) => {
    stream.write(`data: ${JSON.stringify(doc)}\n\n`)
  })
    .on('close', () => {
      stream.write(`ended initial data\n\n`)
    })

  Message.watch()
    .on('change', (doc) => {
      const data = Object.assign({}, doc.fullDocument, {operationType: doc.operationType})
      stream.write(`data: ${JSON.stringify(data)}\n\n`)
    })
}

async function renderForm(ctx) {
  console.log('files');
  await ctx.render('file_upload');
}

async function renderMessages(ctx) {
  await ctx.render('messages');
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
    const [, src] = readAndWriteFile(image);
    response.image = true;
    response.imgSrc = src;
  }

  if (audio && audio.size) {
    const [, src] = readAndWriteFile(audio);
    response.audio = true;
    response.audioSrc = src;
  }

  ctx.body = JSON.stringify(response);
  console.log('[handleForm finished]');
  // ctx.redirect('/files');
}

async function getPrepods(ctx) {
  ctx.body = await Prepod.find()
}

async function findPrepodById(ctx) {
  try {
    const prepod = await Prepod.findById(ctx.params.id);
    if (!prepod) {
      ctx.throw(404);
    }
    ctx.body = prepod;
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.throw(404);
    }
    ctx.throw(500);
  }
}

async function addPrepod(ctx) {
  try {
    ctx.body = await new Prepod(ctx.request.body).save();
  } catch (err) {
    ctx.throw(422);
  }
}

async function updatePrepod(ctx) {
  try {
    const prepod = await Prepod.findByIdAndUpdate(
      ctx.params.id,
      ctx.request.body
    );
    if (!prepod) {
      ctx.throw(404);
    }
    ctx.body = prepod;
  } catch (err) {
    if (err.name === 'CastError' || err.name === 'NotFoundError') {
      ctx.throw(404);
    }
    ctx.throw(500);
  }
}

app.use(router.routes());

app.listen(process.env.PORT || 9000)
app.on('error', err => {
  console.error('[server error]', err);
});
