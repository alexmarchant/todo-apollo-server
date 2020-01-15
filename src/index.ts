import { ApolloServer, gql } from 'apollo-server'
import { User, Todo, initDB } from './db'

initDB()

const typeDefs = gql`
  type Query {
    me: User
    todos: [Todo]
  }

  type Mutation {
    signup (name: String!, email: String!, password: String!): String
    login (email: String!, password: String!): String
    createTodo (title: String!): Todo
    deleteTodo (id: Int!): Todo
    updateTodo (id: Int!, title: String!, done: Boolean!): Todo
  }

  type User {
    id: Int!
    name: String!
    email: String!
  }

  type Todo {
    id: Int!
    title: String!
    done: Boolean!
    userId: Int!
  }
`

interface Context {
  user?: User;
}

const resolvers = {
  Query: {
    me(parent: {}, args: {}, context: Context): User {
      const { user } = context
      if (!user) {
        throw new Error('Not logged in')
      }
      return user
    },

    async todos(parent: {}, args: {}, context: Context): Promise<Todo[]> {
      const { user } = context
      if (!user) {
        throw new Error('Not logged in')
      }
      const todos = await Todo.findAll({ where: { userId: user.id }})
      if (!todos) {
        throw new Error('Not found')
      }
      return todos
    },
  },
  Mutation: {
    async login(parent: {}, args: { name?: string; email?: string; password?: string }): Promise<string> {
      if (!args.email || !args.password) {
        throw new Error('Missing required args')
      }
      const user = await User.findOne({ where: { email: args.email }})
      if (!user) {
        throw new Error('No user with that email')
      }
      if (user.password !== args.password) {
        throw new Error('Invalid password')
      }
      return '1234'
    },

    async signup(parent: {}, args: { name?: string; email?: string; password?: string }): Promise<string> {
      if (!args.name || !args.email || !args.password) {
        throw new Error('Missing required args')
      }
      const existingUser = await User.findOne({ where: { email: args.email }})
      if (existingUser) {
        throw new Error('User with that email exists')
      }
      const user = new User()
      user.name = args.name
      user.email = args.email
      user.password = args.password
      await user.save()
      return '1234'
    },
    
    async createTodo(parent: {}, args: { title?: string }, context: Context): Promise<Todo> {
      const { user } = context
      if (!user) {
        throw new Error('Not logged in')
      }
      if (!args.title) {
        throw new Error('Missing required args')
      }
      const todo = new Todo()
      todo.title = args.title
      todo.userId = user.id
      await todo.save()
      return todo
    },

    async deleteTodo(parent: {}, args: { id?: number }, context: Context): Promise<Todo> {
      const { user } = context
      if (!user) {
        throw new Error('Not logged in')
      }
      if (!args.id) {
        throw new Error('Missing required args')
      }
      const todo = await Todo.findByPk(args.id) as Todo
      if (!todo) {
        throw new Error('Todo with that id does not exist')
      }
      await todo.destroy()
      return todo
    },

    async updateTodo(parent: {}, args: { id?: number; title?: string; done?: boolean }, context: Context): Promise<Todo> {
      const { user } = context
      if (!user) {
        throw new Error('Not logged in')
      }
      if (!args.id || !args.title || typeof args.done !== 'boolean') {
        throw new Error('Missing required args')
      }
      const todo = await Todo.findByPk(args.id) as Todo
      if (!todo) {
        throw new Error('Todo with that id does not exist')
      }
      todo.title = args.title
      todo.done = args.done
      await todo.save()
      return todo
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  async context ({ req }): Promise<Context>  {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (token !== '1234') {
      return {}
    }
    const user = await User.findOne()
    return { user }
  },
})

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`)
})