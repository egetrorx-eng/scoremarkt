import { useSafeLogin } from './PrivyProvider';

interface LoginButtonProps {
    className?: string;
    children: React.ReactNode;
}

export default function LoginButton({ className, children }: LoginButtonProps) {
    const { login } = useSafeLogin({
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
