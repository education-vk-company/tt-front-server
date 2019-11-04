const { GraphQLObjectType } =  require('graphql');

const queryAllPrepods = require('./queryAllPrepods')
const queryPrepodById = require('./queryPrepodById');

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    queryPrepodById,
    queryAllPrepods,
  }
})

module.exports = RootQuery;

