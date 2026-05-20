import type { CreateUser } from "../services/users"

type RegistrationFormProps = {
  addUser: (event: React.SyntheticEvent<HTMLFormElement>) => Promise<void>,
  newUser: CreateUser,
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const RegistrationForm = ({
  addUser,
  newUser,
  handleChange
}: RegistrationFormProps) => {
  return (
    <div>
      <form onSubmit={addUser}>
        <div>
          Email:
          <input
            name="email"
            value={newUser.email}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          Name:
          <input
            name="name"
            value={newUser.name}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          Password:
          <input
            type="password"
            name="password"
            value={newUser.password}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">register</button>
      </form>
    </div>
  )
}

export default RegistrationForm
