export const signupValidation = {
  name: ['required', 'string', 'min:5'],
  username: ['required', 'string', 'min:5'],
  email: ['required', 'string', 'email'],
  password: ['required', 'string', 'min:5'],
}
