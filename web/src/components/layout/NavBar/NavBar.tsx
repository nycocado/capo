"use client";
import {Navbar, Nav, Button} from "react-bootstrap";
import Image from 'next/image'
import {ArrowLeftEndOnRectangleIcon} from "@heroicons/react/16/solid";
import {UserIcon} from "@heroicons/react/16/solid";
import {ChevronRightIcon} from "@heroicons/react/16/solid";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/routes";
import Cookies from 'js-cookie';
import {useState} from 'react';
import {ConfirmModal} from "@components/layout/Modals";

function NavBar({title, fixed}: { title?: string, fixed?: boolean }) {
    const [showConfirm, setShowConfirm] = useState(false);
    const router = useRouter();
    const handleLogout = () => setShowConfirm(true);

    const confirmLogout = () => {
        Cookies.remove('token', {path: '/'});
        setShowConfirm(false);
        router.push(ROUTES.login);
    };
    const cancelLogout = () => setShowConfirm(false);

    return (
        <>
            <Navbar
                className="mx-4"
                fixed={fixed ? "top" : undefined}
                variant="dark"
                expand={true}
            >
                <Navbar.Brand className="d-flex align-items-center">
                    <Button variant="link" className="p-0">
                        <Image src="logo-small.svg" width={40} height={50} alt="logo"
                               onClick={() => router.push(ROUTES.home)}/>
                    </Button>
                    <ChevronRightIcon width={40} height={40} className="text-primary ms-2"/>
                    <span className="fs-3 fw-semibold ms-2 text-primary">{title || 'Factory'}</span>
                </Navbar.Brand>
                <Nav className="ms-auto align-items-center gap-4">
                    <Button variant="link" className="p-0 ms-3">
                        <UserIcon width={40} height={40} className="text-primary"/>
                    </Button>
                    <Button variant="link" className="p-0" onClick={handleLogout}>
                        <ArrowLeftEndOnRectangleIcon width={40} height={40} className="text-primary"/>
                    </Button>
                </Nav>
            </Navbar>
            <ConfirmModal
                show={showConfirm}
                onHide={cancelLogout}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                body="Are you sure you want to logout?"
            />
        </>
    )
}

export default NavBar;

