const { GraphQLObjectType, GraphQLString } = require('graphql');
const prepodGraphQLType = require('./../types/prepodType');
const Prepod = require('./../../models/prepod');

module.exports = {
  type: prepodGraphQLType,
  args: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    severity: { type: GraphQLString }
  },
  resolve(parent, args) {
    return Prepod.findById(args.id)
      .then(prepod => {
        prepod.name = args.name
        prepod.last_name = args.last_name,
        prepod.severity = args.severity

        return prepod.save()

      })
      .then(updatedPrepod => updatedPrepod)
      .catch(err => console.log(err))
  }
};

