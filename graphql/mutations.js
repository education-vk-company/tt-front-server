const { GraphQLObjectType } = require('graphql');

const addPrepod = require('./mutations/addPrepod');
const updatePrepod = require('./mutations/updatePrepod');

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addPrepod,
    updatePrepod,
  }
})

module.exports = Mutation
