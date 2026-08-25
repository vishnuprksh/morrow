import { AuthForm } from '../auth-form';

export default function SignUpPage() {
  return <><h1>Create your account</h1><p className="auth-intro">Keep your thinking private and portable.</p><AuthForm mode="sign-up" /></>;
}
