"use client";

import {Button} from "react-bootstrap";
import {useRouter} from "next/navigation";

function NotFound() {
    const router = useRouter();

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-black overflow-auto text-primary">
            <div className="text-center">
                <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
                <p className="text-lg mt-3">The page you are looking for does not exist.</p>
                <Button className="mt-3"
                        onClick={() => router.push('/')}>
                    Go to Home
                </Button>
            </div>
        </div>
    );
}

export default NotFound;