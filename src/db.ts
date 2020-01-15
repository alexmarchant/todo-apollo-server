import { Model, DataTypes, Sequelize } from 'sequelize'

const sequelize = new Sequelize('sqlite::memory:')

export class User extends Model {
  id!: number
  name!: string
  email!: string
  password?: string
  readonly createdAt!: Date
  readonly updatedAt!: Date
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'user',
  }
)

export class Todo extends Model {
  id!: number
  title!: string
  done!: boolean
  userId!: number
  readonly createdAt!: Date
  readonly updatedAt!: Date
}

Todo.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'todo',
  }
)

Todo.belongsTo(User)

export async function initDB(): Promise<void> {
  await sequelize.sync()
}
