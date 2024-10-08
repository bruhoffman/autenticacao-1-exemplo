import { UserDatabase } from "../database/UserDatabase"
import { GetUsersInputDTO, GetUsersOutputDTO } from "../dtos/getUsers.dto"
import { LoginInputDTO, LoginOutputDTO } from "../dtos/login.dto"
import { SignupInputDTO, SignupOutputDTO } from "../dtos/signup.dto"
import { BadRequestError } from "../errors/BadRequestError"
import { NotFoundError } from "../errors/NotFoundError"
import { USER_ROLES, User } from "../models/User"
import { HashManager } from "../services/HashManager"
import { IdGenerator } from "../services/IdGenerator"
import { TokenMananger, TokenPayload } from "../services/TokenManager"

export class UserBusiness {
  constructor(
    private userDatabase: UserDatabase,
    private idGenerator: IdGenerator,
    private tokenMananger: TokenMananger,
    private hashManager: HashManager
  ) { }

  public getUsers = async (input: GetUsersInputDTO): Promise<GetUsersOutputDTO> => {
    const { q, token } = input

    //geramos o payload a partir do token
    const payload = this.tokenMananger.getPayload(token)

    //validamos a assinatura do toke (vem null se inválido)
    if (payload === null) {
      throw new BadRequestError("Token inválido!")
    }

    //somente quem é ADMIN pode acessar a lista de usuários.
    if (payload.role !== USER_ROLES.ADMIN) {
      throw new BadRequestError("Somente os Admins podem acessar esse recurso!")
    }

    const usersDB = await this.userDatabase.findUsers(q)

    const users = usersDB.map((userDB) => {
      const user = new User(
        userDB.id,
        userDB.name,
        userDB.email,
        userDB.password,
        userDB.role,
        userDB.created_at
      )

      return user.toBusinessModel()
    })

    const output: GetUsersOutputDTO = users

    return output
  }

  public signup = async (input: SignupInputDTO): Promise<SignupOutputDTO> => {

    const { name, email, password } = input

    const id = this.idGenerator.generate()

    const hashedPassword = await this.hashManager.hash(password)

    const newUser = new User(
      id,
      name,
      email,
      hashedPassword,
      USER_ROLES.NORMAL, // só é possível criar users com contas normais
      new Date().toISOString()
    )

    const newUserDB = newUser.toDBModel()
    await this.userDatabase.insertUser(newUserDB)

    const tokenPayload: TokenPayload = {
      id: newUser.getId(),
      name: newUser.getName(),
      role: newUser.getRole()
    }

    const token = this.tokenMananger.createToken(tokenPayload)

    const output: SignupOutputDTO = {
      message: "Cadastro realizado com sucesso",
      token
    }

    return output
  }

  public login = async (input: LoginInputDTO): Promise<LoginOutputDTO> => {
    const { email, password } = input

    const userDB = await this.userDatabase.findUserByEmail(email)

    if (!userDB) {
      throw new NotFoundError("'email' não encontrado")
    }

    // o password hasheado está no BD
    const hashedPassword = userDB.password

    // o serviço hashManager analisa o password do body (plaintext) e o hash.
    const isPasswordCorrect = await this.hashManager.compare(password, hashedPassword)

    // valida o resultado
    if (!isPasswordCorrect) {
      throw new BadRequestError("'email' ou 'password' incorretos")
    }

    const user = new User(
      userDB.id,
      userDB.name,
      userDB.email,
      userDB.password,
      userDB.role,
      userDB.created_at
    )

    const payload: TokenPayload = {
      id: user.getId(),
      name: user.getName(),
      role: user.getRole()
    }

    const token = this.tokenMananger.createToken(payload)

    const output: LoginOutputDTO = {
      message: "Login realizado com sucesso",
      token
    }

    return output
  }
}