const { GraphQLObjectType, GraphQLString } = require('graphql');
const prepodGraphQLType = require('./../types/prepodType');
const Prepod = require('./../../models/prepod');

module.exports = {
  type: prepodGraphQLType,
  args: {
    name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    severity: { type: GraphQLString }
  },
  resolve(parent, args) {
    const newprepod = new Prepod({
      name: args.name,
      last_name: args.last_name,
      severity: args.severity,
    })

    return newprepod.save();
  }
};

