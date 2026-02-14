import { useLogin } from '@privy-io/react-auth';

interface LoginButtonProps {
    className?: string;
    children: React.ReactNode;
}

export default function LoginButton({ className, children }: LoginButtonProps) {
    const { login } = useLogin({
        onComplete: ({ user, isNewUser, wasAlreadyAuthenticated }) => {
            console.log('Login complete', { user, isNewUser, wasAlreadyAuthenticated });
            window.location.href = '/portfolio';
        }
    });

    return (
        <button
            onClick={login}
            className={className}
        >
            {children}
        </button>
    );
}
