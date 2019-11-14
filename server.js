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
const PassThrough = require('stream').PassThrough;
const schema = require('./graphql/schema');

const Message = require('./models/message');
const Prepod = require('./models/prepod');

const initDB = require('./database');
initDB();

const readAndWriteFile = (file) => {
  const reader = fs.createReadStream(file.path);
  const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
  reader.pipe(stream);
  console.log('uploading %s -> %s', file.name, stream.path);
  return stream;
}

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


router.get("/messages/:id", findMessageById);
router.get("/messages", getMessages);
router.get("/messages-view", renderMessages);
router.post("/add-message", postMessage);

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

  ctx.req.setTimeout(Number.MAX_VALUE);
  ctx.type = 'text/event-stream; charset=utf-8';
  ctx.set('Cache-Control', 'no-cache');
  ctx.set('Connection', 'keep-alive');
  ctx.status = 200;
  const stream = new PassThrough()
  ctx.body = stream;

  const cursor = Message.find().cursor()

  cursor
    .on('data', (doc) => {
    stream.write(`data: ${JSON.stringify(doc)}\n\n`)
  })
    .on('close', () => {
      stream.write(`ended initial data\n\n`)
    })

  Message.watch()
    .on('change', (doc) => {
      if (doc.operationType === 'insert') {
        stream.write(`data: ${JSON.stringify(doc.fullDocument)}\n\n`)
      }
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
