const { GraphQLObjectType, GraphQLString } = require('graphql');

const PrepodType = new GraphQLObjectType({
  name: 'Prepod',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    last_name: { type: GraphQLString },
    severity: { type: GraphQLString }
  })
});

module.exports = PrepodType;
