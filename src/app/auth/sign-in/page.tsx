import { AuthForm } from '../auth-form';

export default function SignInPage() {
  return <><h1>Welcome back</h1><p className="auth-intro">Sign in to return to your notes.</p><AuthForm mode="sign-in" /></>;
}
