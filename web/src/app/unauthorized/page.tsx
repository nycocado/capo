"use client";

import {useRouter} from "next/navigation";
import {Button} from "react-bootstrap";

function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">Unauthorized</h1>
                <p className="text-lg">You do not have permission to access this page.</p>
                <Button className="mt-3"
                    onClick={() => router.push('/')}>
                    Go to Home
                </Button>
            </div>
        </div>
    );
}

export default UnauthorizedPage;