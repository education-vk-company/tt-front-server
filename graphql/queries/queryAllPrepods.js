const { GraphQLList } =  require('graphql');
const prepodGraphQLType = require('./../types/prepodType');
const Prepod = require('../../models/prepod');

module.exports = {
  type: new GraphQLList(prepodGraphQLType),
  args: {},
  resolve() {
    return Prepod.find({})
  }
}
