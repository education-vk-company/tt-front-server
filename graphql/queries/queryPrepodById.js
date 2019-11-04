
const { GraphQLString } =  require('graphql');
const prepodGraphQLType = require('./../types/prepodType');
const Prepod = require('../../models/prepod');

module.exports = {
  type: prepodGraphQLType,
  args: { id: { type: GraphQLString }},
  resolve(parent, args) {
    return Prepod.findById(args.id)
  }
};

