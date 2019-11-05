const Koa = require('koa');

const mount = require('koa-mount');
const graphqlHTTP = require('koa-graphql');
const router = require('koa-router')();
const cors = require('@koa/cors');

const schema = require('./graphql/schema');
const Prepod = require('./models/prepod');


const initDB = require('./database');

initDB();

const app = new Koa();
app.use(cors());

router.get('/', getPrepods);
router.post('/', addPrepod);
router.get('/:id', findPrepodById);

app.use(router.routes());

app.use(mount('/graphql', graphqlHTTP({
  schema: schema,
  graphiql: true
})))

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

app.listen(9000);
app.on('error', err => {
  log.error('server error', err)
});
